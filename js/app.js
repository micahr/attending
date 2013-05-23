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

App.Event = DS.Firebase.Model.extend({
  name: DS.attr("string"),
  date: DS.attr("date"),

  formattedDate: function(){
    return moment(this.get("date")).format("MMM Do YYYY h:mm:ss a")
  }.property("date")
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