App = Ember.Application.create({LOG_TRANSITIONS: true});

App.Store = DS.Store.extend({
  revision: 12,
  adapter: DS.Firebase.Adapter.create({
    dbName: "micahr"
  })
});

App.Router.map(function() {
  this.resource("events");
  this.resource("event", {path: "/events/:event_id"}, function(){
    this.route("edit");
  });
});
App.Router.reopen({
  location: 'history'
});

App.Event = DS.Firebase.LiveModel.extend({
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

App.EventsRoute = Ember.Route.extend({
  model: function() {
    return App.Event.find();
  }
});