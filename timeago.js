/*
 * node-timeago
 * DB.Murphy
 * <rainbolean@sina.com>
 * Oct 6, 2015
 *
 * @name timeago
 * @version 0.2.1
 */
module.exports = function (timestamp) {
  if (timestamp instanceof Date) {
    return inWords(timestamp);
  } else if (typeof timestamp === "string") {
    return inWords(parse(timestamp));
  } else if (typeof timestamp === "number") {
    return inWords(new Date(timestamp))
  }
};

var settings = {
  allowFuture: false,
  strings: {
    prefixAgo: null,
    prefixFromNow: null,
    suffixAgo: "前",
    suffixFromNow: "from now",
    seconds: "小于1分钟",
    minute: "1分钟",
    minutes: "%d 分钟",
    hour: "大约1小时",
    hours: "大约 %d 小时",
    day: "1天",
    days: "%d 天",
    month: "大约一个月",
    months: "%d 个月",
    year: "大约一年",
    years: "%d 年",
    numbers: []
  }
};

var $l = settings.strings;

module.exports.settings = settings;

$l.inWords = function (distanceMillis) {
  var prefix = $l.prefixAgo;
  var suffix = $l.suffixAgo;
  if (settings.allowFuture) {
    if (distanceMillis < 0) {
      prefix = $l.prefixFromNow;
      suffix = $l.suffixFromNow;
    }
  }

  var seconds = Math.abs(distanceMillis) / 1000;
  var minutes = seconds / 60;
  var hours = minutes / 60;
  var days = hours / 24;
  var years = days / 365;

  function substitute (stringOrFunction, number) {
    var string = typeof stringOrFunction === 'function' ? stringOrFunction(number, distanceMillis) : stringOrFunction;
    var value = ($l.numbers && $l.numbers[number]) || number;
    return string.replace(/%d/i, value);
  }

  var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
    seconds < 90 && substitute($l.minute, 1) ||
    minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
    minutes < 90 && substitute($l.hour, 1) ||
    hours < 24 && substitute($l.hours, Math.round(hours)) ||
    hours < 48 && substitute($l.day, 1) ||
    days < 30 && substitute($l.days, Math.floor(days)) ||
    days < 60 && substitute($l.month, 1) ||
    days < 365 && substitute($l.months, Math.floor(days / 30)) ||
    years < 2 && substitute($l.year, 1) ||
    substitute($l.years, Math.floor(years));

  return [prefix, words, suffix].join(" ").toString().trim();
};

function parse (iso8601) {
  if (!iso8601) return;
  var s = iso8601.trim();
  s = s.replace(/\.\d\d\d+/,""); // remove milliseconds
  s = s.replace(/-/,"/").replace(/-/,"/");
  s = s.replace(/T/," ").replace(/Z/," UTC");
  s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
  return new Date(s);
}

$l.parse = parse;

function inWords (date) {
  return $l.inWords(distance(date));
}

function distance (date) {
  return (new Date().getTime() - date.getTime());
}
