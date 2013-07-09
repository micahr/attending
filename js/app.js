App = Ember.Application.create({LOG_TRANSITIONS: true});

$(document).on("focus", "#event-date", function(){

});
$(document).on("focus", "#event-time", function(){

});

App.Store = DS.Store.extend({
  revision: 12,
  adapter: DS.Firebase.Adapter.create({
    dbName: "micahr"
  })
});

App.Router.map(function() {
  this.resource("events", {path: "/events/"}, function(){
    this.route("new");
  });
  this.resource("event", {path: "/event/:event_id"}, function(){
    this.route("edit");
  });
});
App.Router.reopen({
  location: 'history'
});

App.Event = DS.Firebase.LiveModel.extend({
  name: DS.attr("string"),
  date: DS.attr("date"),
  time: DS.attr("date"),
  description: DS.attr("string"),
  attendees: DS.hasMany("App.Attendee"),

  whosGoing: function(){
    return this.get("attendees").filterProperty("attending","true");
  }.property("attendees.@each.attending"),
  whosNotGoing: function(){
    return this.get("attendees").filterProperty("attending", "false");
  }.property("attendees.@each.attending"),
  whosMaybeGoing: function(){
    return this.get("attendees").filterProperty("attending", "maybe");
  }.property("attendees.@each.attending"),
  calendarDate: function(){
    return moment(this.get("date")).calendar();
  }.property("date"),
  formattedDate: function(){
    return moment(this.get("date")).format("MMM Do YYYY h:mm A");
  }.property("date"),
  simpleDate: function(key, value){
    if (arguments.length !== 1) {
      if (key === "simpleDate" && value != null)
      {
        this.set('date',moment(value, "MM/DD/YYYY hh:mm A").toDate());
      }
    }
    return moment(this.get("date")).format("MM/DD/YYYY hh:mm A");
  }.property("date")
});

App.Attendee = DS.Firebase.LiveModel.extend({
  name: DS.attr("string"),
  attending: DS.attr("string"),
  event: DS.belongsTo("App.Event")
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return App.Event.find();
  }
});

App.EventEditRoute = Ember.Route.extend({
  setupController: function(controller, model){
    controller.set("model", this.controllerFor("event").get("model"));
  }
});

App.EventsIndexRoute = Ember.Route.extend({
  model: function() {
    return App.Event.find();
  }
});

App.EventPartialView = Ember.View.extend({
  DateView: Ember.TextField.extend({
    attributeBindings: ['data-format'],
    "data-format":"MM/dd/yyyy HH:mm PP",
    didInsertElement: function(){
      var controller = this.get('controller');
      var self = this;
      $("#datetimepicker").datetimepicker({
        language: 'en',
        pick12HourFormat: true,
        pickSeconds: false,
        startDate: new Date()
      }).on("changeDate", function(evt){
          console.log(self);
          controller.get("model").set("simpleDate", moment(evt.date.valueOf()).format("MM/DD/YYYY hh:mm A"));
          self.set("value", moment(evt.date.valueOf()).format("MM/DD/YYYY hh:mm A"));
          //controller.get('model').set("date", );
        });
      $("#datetimepicker").data("datetimepicker").setDate(controller.get("model.date"));
    }
  })
});

App.EventsIndexController = Ember.ArrayController.extend({
  currentEvents: function(){
    return this.get("model").filter(function(item){
      return item.get("date") >= new Date();
    });
  }.property("model.@each.date")
});

App.EventController = Ember.ObjectController.extend({
  attendeeNameEntered: function(){
    var attendeeName = this.get("attendeeName") || "";
    if (attendeeName.length > 0)
      $(".attending-btns").slideDown();
    else
      $(".attending-btns").slideUp();
  }.observes("attendeeName"),
  attending: function(){
    this.addAttendee(this.get("attendeeName"), "true");
  },
  notAttending: function(){
    this.addAttendee(this.get("attendeeName"), "false");
  },
  maybe: function(){
    this.addAttendee(this.get("attendeeName"), "maybe");
  },
  addAttendee: function(name, attending){
    if (!name){return;}
    if (!name.trim()){return;}
    var event = this.get("model");
    var attendee = App.Attendee.createRecord({name: name, attending: attending});
    event.get("attendees").pushObject(attendee);
    attendee.save();
    event.save();
    this.set("attendeeName", "");
  }
});

App.EventEditController = Ember.ObjectController.extend({
  cancelEvent: function(){
    return this.transitionToRoute("event");
  },
  saveEvent: function(){
    this.get("model").save();
    this.transitionToRoute("event")
  },
  deleteEvent: function(){
    var event = this.get("model");
    event.deleteRecord();
    event.save();
  }
});

App.EventsNewController = Ember.ArrayController.extend({
  createEvent: function(){
    var name = this.get("name");
    var description = this.get("description");
    if (!name.trim() || !description.trim()){return;}
    var date = this.get("simpleDate");
    console.log(date);
    var momentDate = moment(date, "MM/DD/YYYY hh:mm A");
    if (!momentDate.isValid()){return;}
    var event = App.Event.createRecord({
      name: name,
      description: description,
      date: momentDate.toDate()
    });

    this.set("name", "");
    this.set("date", "");
    this.set("description", "");

    event.save()
  }
});
