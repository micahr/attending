App = Ember.Application.create({LOG_TRANSITIONS: true});

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
  description: DS.attr("string"),
  attendees: DS.hasMany("App.Attendee"),

  whosGoing: function(){
    console.log(this.get("attendees").filterProperty("attending"));
    return this.get("attendees").filterProperty("attending");
  }.property("attendees.@each.attending"),
  whosNotGoing: function(){
    return this.get("attendees").filterProperty("attending", false);
  }.property("attendees.@each.attending"),
  calendarDate: function(){
    return moment(this.get("date")).calendar();
  }.property("date"),
  formattedDate: function(){
    return moment(this.get("date")).format("MMM Do YYYY h:mm:ss a");
  }.property("date")
});

App.Attendee = DS.Firebase.LiveModel.extend({
  name: DS.attr("string"),
  attending: DS.attr("boolean"),
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

App.AddAttendeeView = Ember.View.extend({
  tagName: 'div'
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
    this.addAttendee(this.get("attendeeName"), true);
  },
  notAttending: function(){
    this.addAttendee(this.get("attendeeName"), false);
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
    var date = this.get("date");

    var event = App.Event.createRecord({
      name: name,
      description: description,
      date: moment().add("days",1) .toDate()
    });

    this.set("name", "");
    this.set("date", "");
    this.set("description", "");

    event.save()
  }
});
