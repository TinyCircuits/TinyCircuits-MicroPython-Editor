// Prototypes that are not implemented in JavaScript

// Array Remove - By John Resig (MIT Licensed) https://stackoverflow.com/a/9815010
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};