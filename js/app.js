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
  this.resource("event", {path: "/events/:event_id"}, function(){
    this.route("edit");
  });
});
App.Router.reopen({
  location: 'history'
});

App.Event = DS.Firebase.Model.extend({
  name: DS.attr("string"),
  date: DS.attr("date"),
  attendees: DS.hasMany("App.Attendee"),

  formattedDate: function(){
    return moment(this.get("date")).format("MMM Do YYYY h:mm:ss a")
  }.property("date")
});

App.Attendee = DS.Firebase.Model.extend({
  name: DS.attr("string"),
  event: DS.belongsTo("App.Event")
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return App.Event.find();
  }
});

App.EventsIndexRoute = Ember.Route.extend({
  model: function() {
    return App.Event.find();
  }
});

App.EventsNewController = Ember.ArrayController.extend({
  createEvent: function(){
    var name = this.get("name");
    if (!name.trim()){return;}
    var date = this.get("date");

    var event = App.Event.createRecord({
      name: name,
      date: moment().add("days",1) .toDate()
    });

    this.set("name", "");
    this.set("date", "");

    event.save()
  }
});
