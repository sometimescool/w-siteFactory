var wsiteFactory = (function () {
  var main = null;
  var modules = {
      "require": {
          factory: undefined,
          dependencies: [],
          exports: function (args, callback) { return require(args, callback); },
          resolved: true
      }
  };
  function define(id, dependencies, factory) {
      return main = modules[id] = {
          dependencies: dependencies,
          factory: factory,
          exports: {},
          resolved: false
      };
  }
  function resolve(definition) {
      if (definition.resolved === true)
          return;
      definition.resolved = true;
      var dependencies = definition.dependencies.map(function (id) {
          return (id === "exports")
              ? definition.exports
              : (function () {
                  if(modules[id] !== undefined) {
                    resolve(modules[id]);
                    return modules[id].exports;
                  } else {
                    try {
                      return require(id);
                    } catch(e) {
                      throw Error("module '" + id + "' not found.");
                    }
                  }
              })();
      });
      definition.factory.apply(null, dependencies);
  }
  function collect() {
      Object.keys(modules).map(function (key) { return modules[key]; }).forEach(resolve);
      return (main !== null) 
        ? main.exports
        : undefined
  }

  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  define("helpers/helper", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var CDom = /** @class */ (function () {
          function CDom() {
          }
          CDom.dataClick = function (el) {
              var value = null;
              value = el.getAttribute("data-click");
              return value;
          };
          CDom.clickHandler = function (el) {
              var elmt = el;
              while (elmt != null && !CDom.dataClick(elmt)) {
                  elmt = elmt.parentElement;
              }
              return elmt;
          };
          return CDom;
      }());
      exports.CDom = CDom;
      var CString = /** @class */ (function () {
          function CString() {
          }
          CString.repeat = function (stringToRepeat, count) {
              var AString = [];
              var nRep = 0;
              while (nRep < count) {
                  AString.push(stringToRepeat);
              }
              return AString.join("");
          };
          CString.padStart = function (stringToPad, targetLength, padString) {
              targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
              padString = String((typeof padString !== 'undefined' ? padString : ' '));
              if (stringToPad.length > targetLength) {
                  return String(stringToPad);
              }
              else {
                  targetLength = targetLength - stringToPad.length;
                  if (targetLength > padString.length) {
                      padString += CString.repeat(padString, targetLength / padString.length); //append to original to ensure we are longer than needed
                  }
                  return padString.slice(0, targetLength) + String(stringToPad);
              }
          };
          CString.split1Date = function (stringDate) {
              var keys = stringDate.split("-");
              var splittedKey = { "month": "", "day": "" };
              if (keys.length == 3) {
                  splittedKey.month = keys[0] + "-" + keys[1];
                  splittedKey.day = keys[2];
              }
              else {
                  throw new Error("Error String.split1Date format (nnnn-nn-nn): value " + stringDate);
              }
              return splittedKey;
          };
          CString.splitDate = function (stringDate) {
              var keys = stringDate.split("-");
              var splittedKey = { "year": 0, "month": 0, "day": 0 };
              if (keys.length == 3) {
                  splittedKey.year = parseInt(keys[0], 10);
                  splittedKey.month = parseInt(keys[1], 10) - 1;
                  splittedKey.day = parseInt(keys[2], 10);
              }
              else {
                  throw new Error("Error String.splitDate format (nnnn-nn-nn): value " + stringDate);
              }
              return splittedKey;
          };
          return CString;
      }());
      exports.CString = CString;
      var CDate = /** @class */ (function () {
          function CDate() {
          }
          /**
           * @param date type Date
           * @return  AAAA-MM-JJ
           */
          CDate.getKey = function (date) {
              var sMonth = CString.padStart((date.getMonth() + 1) + "", 2, "0");
              var sDay = CString.padStart((date.getDate() + ""), 2, "0");
              return date.getFullYear() + "-" + sMonth + "-" + sDay;
          };
          /**
           * @param date type Date
           * @return day with monday as start week
           */
          CDate.getFrenchDay = function (date) {
              var day = date.getDay();
              var frenchDay = (day == 0) ? 7 : day;
              frenchDay--;
              return frenchDay;
          };
          /**
           * @param date type Date
           * @return the day of the first date of the month
           */
          CDate.getFrenchFirstDay = function (date) {
              var firstDate = new Date(date.getFullYear(), date.getMonth(), 1, 4);
              return CDate.getFrenchDay(firstDate);
          };
          /**
           * @param date type Date
           * @return  the week position in the month
           */
          CDate.getFrenchWeekInMonth = function (date) {
              var numWeek = 0;
              return Math.floor((date.getDate() + CDate.getFrenchFirstDay(date) - 1) / 7);
          };
          return CDate;
      }());
      exports.CDate = CDate;
  });
  define("calendar/view", ["require", "exports", "helpers/helper"], function (require, exports, helper_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      //Calendar view
      var CrView = /** @class */ (function () {
          function CrView(container) {
              this._container = container;
              this.monthsContainer = jQuery("<div class='sf-months-container'></div>");
          }
          Object.defineProperty(CrView.prototype, "header", {
              get: function () {
                  var html = [];
                  html.push('<div class="sf-calendar-buttons">');
                  html.push('<div class="sf-button-previous" data-click="previous-group"><i class="sf-icon-angle-double-left"></i></div>');
                  html.push('<div class="sf-button-previous-month"  data-click="previous-month"><i class="sf-icon-angle-left"></i></div>');
                  html.push('<div class="sf-button-next-month"  data-click="next-month"><i class="sf-icon-angle-right"></i></div>');
                  html.push('<div class="sf-button-next"  data-click="next-group"><i class="sf-icon-angle-double-right"></i></div>');
                  html.push('</div>');
                  return jQuery(html.join(""));
              },
              enumerable: true,
              configurable: true
          });
          CrView.prototype.footer = function (legend) {
              var footer = jQuery("<div class='sf-calendar-footer'></div>");
              footer.append("<div class='sf-calendar-legend'><div class='sf-rented sf-icon-legend'></div>Non disponible</div>");
              footer.append("<div class='sf-calendar-legend'><div class='sf-notinit sf-icon-legend'></div>Fermé</div>");
              for (var key in legend) {
                  var sfCssClass = "sf-" + key;
                  footer.append("<div class=\"sf-calendar-legend\"><div class=\"" + sfCssClass + " sf-icon-legend\"></div>" + legend[key] + "</div>");
              }
              return footer;
          };
          Object.defineProperty(CrView.prototype, "container", {
              get: function () {
                  return this._container;
              },
              enumerable: true,
              configurable: true
          });
          CrView.prototype.draw = function (data, legend) {
              this.container.append(this.header);
              this.container.append(this.monthsContainer);
              this.container.append(this.footer(legend));
              this.monthContentDraw(data);
          };
          CrView.prototype.monthContentDraw = function (data) {
              this.monthsContainer.empty();
              for (var yearMonth in data) {
                  var year = parseInt(yearMonth.split("-")[0], 10);
                  var month = parseInt(yearMonth.split("-")[1], 10);
                  this.monthsContainer.append(this.buildMonth(year, month, data[yearMonth]));
              }
          };
          /* data :
      16:{type: "veryhigh"}
      17:{type: "veryhigh", rent: true, start: true}
      18:{type: "veryhigh", rent: true}
      ...
      24:{type: "veryhigh", rent: true, end: true, start: true}
      */
          CrView.prototype.buildMonth = function (year, month, data) {
              var label = this.monthLabel(year, month);
              var content = jQuery('<div class="sf-layout-month">');
              content.append('<div class="sf-header-month">' + label + '</div>');
              var monthContent = jQuery('<table class="sf-month-content" cellspacing="0"></div>');
              monthContent.append("<tr><th>Lun</th><th>Mar</th><th>Mer</th><th>Jeu</th><th>Ven</th><th>Sam</th><th>Dim</th></tr>");
              content.append(monthContent);
              var noWeek = -1;
              var dayArray = [];
              var monthArray = [];
              var noDay;
              for (var length_1 = data.length, i = 0; i < length_1; i++) {
                  var date = new Date(year, month - 1, parseInt(data[i].day, 10), 4);
                  if (noWeek != helper_1.CDate.getFrenchWeekInMonth(date)) {
                      noDay = "";
                      dayArray = this.initWeek();
                      monthArray.push(dayArray);
                      noWeek = helper_1.CDate.getFrenchWeekInMonth(date);
                  }
                  noDay = parseInt(data[i].day, 10) + "";
                  dayArray[helper_1.CDate.getFrenchDay(date) + 1] = this.htmlDay(noDay, data[i].data);
              }
              while (monthArray.length < 6) {
                  monthArray.push(this.initWeek());
              }
              monthContent.append(jQuery(monthArray.join("")));
              return content;
          };
          CrView.prototype.initWeek = function () {
              return ['<tr>', this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), '</tr>'];
          };
          CrView.prototype.htmlDay = function (noDay, params) {
              var html = '';
              var cssCel = '';
              var rentedMorning = (params.rent && !params.start) || (params.rent && params.start && params.end);
              var rentedAfternoon = (params.rent && !params.end) || (params.rent && params.start && params.end);
              var cssMorning = "sf-calendar-day-morning " + (rentedMorning ? 'sf-rented' : params.typeMorning);
              var cssAfternoon = "sf-calendar-day-afternoon " + (rentedAfternoon ? 'sf-rented' : params.typeAfternoon);
              cssCel = ((rentedMorning && rentedAfternoon) || (params.typeMorning == " sf-notinit" && params.typeAfternoon == " sf-notinit")) ? " sf-notfree" : "";
              html = "<td class=\"sf-calendar-day" + cssCel + "\">";
              html += noDay;
              html += '<div class="' + cssMorning + '"></div>';
              html += '<div class="' + cssAfternoon + '"></div>';
              html += "</td>";
              return html;
          };
          CrView.prototype.monthLabel = function (year, month) {
              var index = month - 1;
              var label = ["Janvier", "F&eacute;vrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Ao&ucirc;t", "Septembre", "Octobre", "Novembre", "D&eacute;cembre"];
              return label[index] + " " + year;
          };
          return CrView;
      }());
      exports.CrView = CrView;
  });
  define("calendar/model", ["require", "exports", "helpers/helper", "helpers/helper"], function (require, exports, helper_2, helper_3) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var CrModel = /** @class */ (function () {
          function CrModel(dataid, dataRoot) {
              this.dataid = dataid;
              this._dataRoot = dataRoot;
              this._periods = null;
              this._availabilities = null;
              this._data = null;
              this._lastKey = "";
          }
          Object.defineProperty(CrModel.prototype, "lastKey", {
              get: function () {
                  return this._lastKey;
              },
              enumerable: true,
              configurable: true
          });
          CrModel.prototype.getPeriods = function (location) {
              var self = this;
              try {
                  return new Promise(function (resolve, reject) {
                      if (self._periods) {
                          resolve();
                      }
                      else {
                          jQuery.getJSON(location, function (data) {
                              self._periods = data[self.dataid] || data;
                              resolve();
                          }).fail(function () { return reject("Periods"); });
                      }
                  });
              }
              catch (e) {
                  throw Error("Promise");
              }
          };
          CrModel.prototype.getAvailabilities = function (location) {
              var self = this;
              try {
                  return new Promise(function (resolve, reject) {
                      if (self._availabilities) {
                          resolve();
                      }
                      else {
                          jQuery.getJSON(location, function (data) {
                              self._availabilities = data[self.dataid] || data;
                              resolve();
                          }).fail(function () { return reject("Availabilities"); });
                      }
                  });
              }
              catch (e) {
                  throw Error("Promise");
              }
          };
          CrModel.prototype.getLegend = function (location) {
              var self = this;
              try {
                  return new Promise(function (resolve, reject) {
                      jQuery.getJSON(location, function (data) {
                          resolve(data[self.dataid] || data);
                      }).fail(function () { return reject("Legend"); });
                  });
              }
              catch (e) {
                  throw Error("Promise");
              }
          };
          CrModel.prototype.data = function (start, monthCount) {
              if (!this._data) {
                  //merge and reorganized datas
                  this._data = {};
                  this.buildPeriods();
                  this.buildAvailabilities();
              }
              ;
              return this.dataReduce(start, monthCount);
          };
          /* reduce data from start month to month count to display.
          called each time start month change*/
          CrModel.prototype.dataReduce = function (start, monthCount) {
              var data = {};
              var dateStart = new Date(start.year, start.month, 1, 5);
              var dateEnd = new Date(start.year, start.month + monthCount, 0, 5);
              var startKey = helper_3.CDate.getKey(dateStart);
              var endKey = helper_3.CDate.getKey(dateEnd);
              var splittedKey;
              for (var monthDay in this._data) {
                  if (monthDay >= startKey && monthDay <= endKey) {
                      splittedKey = helper_2.CString.split1Date(monthDay);
                      data[splittedKey.month] = data[splittedKey.month] || [];
                      data[splittedKey.month].push({ "day": splittedKey.day, "data": this._data[monthDay] });
                  }
              }
              return data;
          };
          Object.defineProperty(CrModel.prototype, "datas", {
              get: function () {
                  return this._data;
              },
              enumerable: true,
              configurable: true
          });
          //build periods for all datas
          CrModel.prototype.buildPeriods = function () {
              var self = this;
              var lastKey = "";
              var _loop_1 = function (year) {
                  self._periods[year].forEach(function (elt) {
                      var date = new Date(parseInt(year, 10), parseInt(elt.start.split("-")[0], 10) - 1, parseInt(elt.start.split("-")[1], 10));
                      var dateStart = new Date(parseInt(year, 10), parseInt(elt.start.split("-")[0], 10) - 1, parseInt(elt.start.split("-")[1], 10));
                      var dateEnd = new Date(parseInt(year, 10), parseInt(elt.end.split("-")[0], 10) - 1, parseInt(elt.end.split("-")[1], 10));
                      var keyToDay = helper_3.CDate.getKey(new Date());
                      while (date.getTime() <= dateEnd.getTime()) {
                          var key = helper_3.CDate.getKey(date);
                          if (key > lastKey)
                              lastKey = key;
                          self._data[key] = self._data[key] || {};
                          var startPeriod = (date.getTime() == dateStart.getTime());
                          var endPeriod = (date.getTime() == dateEnd.getTime());
                          if (key > keyToDay) {
                              self._data[key].typeMorning = ((self._data[key].typeMorning) ? self._data[key].typeMorning : "") + (!startPeriod || (startPeriod && endPeriod) ? (" " + "sf-" + elt.type) : "");
                              self._data[key].typeAfternoon = ((self._data[key].typeAfternoon) ? self._data[key].typeAfternoon : "") + (!endPeriod || (startPeriod && endPeriod) ? (" " + "sf-" + elt.type) : "");
                          }
                          else {
                              self._data[key].overDate = true;
                              self._data[key].rent = true;
                          }
                          date = new Date(date.getFullYear(), date.getMonth(), (date.getDate() + 1));
                      }
                  });
              };
              for (var year in self._periods) {
                  _loop_1(year);
              }
              self._lastKey = lastKey;
          };
          //build availabilities for all datas
          CrModel.prototype.buildAvailabilities = function () {
              var self = this;
              var _loop_2 = function (year) {
                  self._availabilities[year].forEach(function (elt) {
                      var date = new Date(parseInt(year, 10), parseInt(elt.start.split("-")[0], 10) - 1, parseInt(elt.start.split("-")[1], 10));
                      var dateEnd = new Date(parseInt(year, 10), parseInt(elt.end.split("-")[0], 10) - 1, parseInt(elt.end.split("-")[1], 10));
                      var dateStart = date;
                      while (date.getTime() <= dateEnd.getTime()) {
                          var key = helper_3.CDate.getKey(date);
                          self._data[key] = self._data[key] || {};
                          self._data[key].rent = true;
                          if (!self._data[key].overDate) {
                              if (dateStart.getTime() == date.getTime())
                                  self._data[key].start = true;
                              if (dateEnd.getTime() == date.getTime())
                                  self._data[key].end = true;
                          }
                          date = new Date(date.getFullYear(), date.getMonth(), (date.getDate() + 1));
                      }
                  });
              };
              for (var year in self._availabilities) {
                  _loop_2(year);
              }
          };
          return CrModel;
      }());
      exports.CrModel = CrModel;
  });
  define("calendar/messages", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.messagesfr = {
          "Header": "Le calendrier ne peut pas être affiché.",
          "Promise": ["Votre navigateur ne prend pas en charge certaines fonctionnalités indispensables.",
              "Merci d'utiliser un navigateur plus récent."],
          "Availabilities": ["Disponibilités non trouvées", "Vérifiez les paramètres du composant (data-params)"],
          "Periods": ["Periodes non trouvées.", "Vérifiez les paramètres du composant (data-params)"],
          "Legend": ["Légende non trouvée.", "Vérifiez les paramètres du composant (data-params)"]
      };
  });
  define("helpers/message", ["require", "exports", "helpers/helper"], function (require, exports, helper_4) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      function instanceOfImessage(object) {
          var isHeader = (object !== undefined && object !== null && object.header !== undefined && object.header !== null && typeof object.header === "string");
          var isMessage = (object.message !== undefined && object.message !== null && object.message instanceof Array);
          return isHeader && isMessage;
      }
      var CMessage = /** @class */ (function () {
          function CMessage() {
              this.$frame = jQuery("<div class=\"sf-message-box\"></div>");
          }
          CMessage.prototype.messsageBoxList = function () {
              var $list = jQuery(".sf-message-box");
              return $list;
          };
          CMessage.prototype.error = function (messages, error) {
              this.$frame.addClass("sf-error");
              this.show(this.message(messages, error));
          };
          CMessage.prototype.info = function (content, code) {
              this.$frame.addClass("sf-info");
              this.show(this.message(content, code ? new Error(code) : undefined));
          };
          CMessage.prototype.message = function (messages, error) {
              var messContent;
              var mess;
              if (instanceOfImessage(messages)) {
                  mess = messages;
              }
              else {
                  error = error || new Error("unknonwn");
                  messContent = messages[error.message] || new Array(error.message);
                  mess = {
                      header: messages.Header,
                      message: messContent
                  };
              }
              return mess;
          };
          CMessage.prototype.show = function (content) {
              var count = this.messsageBoxList().length;
              this.$frame.css("z-index", 1000 + count);
              var $header = this.header(content.header);
              var $frameContent = jQuery("<div class=\"sf-message-content\"></div>");
              var strContent = "";
              content.message.forEach(function (line) {
                  strContent += "<div class=\"sf-message-line\">" + line + "</div>";
              });
              $frameContent.append(jQuery(strContent));
              this.$frame.append(this.header(content.header));
              this.$frame.append($frameContent);
              var $body = jQuery("body");
              $body.append(this.$frame);
              var frameWidth = this.$frame.width() || 0;
              var width = ($body.width() || (frameWidth));
              var left = (width - frameWidth) / 2;
              this.$frame.css('left', (left + count * 20) + 'px');
              this.$frame.css('top', (20 + count * 40) + 'px');
              this.triggerEvent();
          };
          CMessage.prototype.triggerEvent = function () {
              var _this = this;
              var el = this.$frame.get(0);
              if (el) {
                  el.addEventListener("click", function (e) { return _this.click(e); }, false);
              }
          };
          CMessage.prototype.click = function (e) {
              var el = e.target;
              el = helper_4.CDom.clickHandler(el);
              if (el) {
                  switch (helper_4.CDom.dataClick(el)) {
                      case "message-close":
                          this.destroy();
                          break;
                  }
              }
          };
          CMessage.prototype.header = function (title) {
              var stringHeader = "<div class=\"sf-message-header\"><div class=\"sf-message-title\">" + title + "</div>";
              stringHeader += "<div class=\"sf-close-popup\" data-click=\"message-close\"><i class=\"sf-icon-cancel\"></i></div>";
              stringHeader += "</div>";
              return jQuery(stringHeader);
          };
          CMessage.prototype.destroy = function () {
              var _this = this;
              var el = document.getElementById("sf-message");
              if (el) {
                  el.removeEventListener("click", function (e) { return _this.click(e); }, false);
              }
              this.$frame.remove();
          };
          return CMessage;
      }());
      exports.CMessage = CMessage;
      function showError(messages, error) {
          var mess = new CMessage().error(messages, error);
      }
      exports.showError = showError;
      function showInfo(content) {
          var mess = new CMessage().info(content);
      }
      exports.showInfo = showInfo;
  });
  define("calendar/controller", ["require", "exports", "calendar/view", "calendar/model", "calendar/messages", "helpers/message", "helpers/helper", "helpers/helper", "helpers/helper"], function (require, exports, view_1, model_1, messages_1, message_1, helper_5, helper_6, helper_7) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      // Calendar controller
      var CrCalendar = /** @class */ (function () {
          function CrCalendar($container, params) {
              this.params = params;
              this.monthCount = params.monthCount;
              this.start = { year: new Date().getFullYear(), month: new Date().getMonth() };
              this.model = new model_1.CrModel(params.dataid, params.dataRoot);
              this.view = new view_1.CrView($container);
              $container.removeAttr("data-params");
          }
          ;
          CrCalendar.prototype.previousGroup = function () {
              var newDate = new Date(this.start.year, this.start.month - this.monthCount, 1, 5);
              this.start = this.computePreviousStart(newDate);
              this.refresh();
          };
          CrCalendar.prototype.previousMonth = function () {
              var newDate = new Date(this.start.year, this.start.month - 1, 1, 5);
              this.start = this.computePreviousStart(newDate);
              this.refresh();
          };
          CrCalendar.prototype.computePreviousStart = function (date) {
              var today = new Date();
              var minDateToDisplay = (date.getTime() < today.getTime()) ? today : date;
              var start = { year: 0, month: 0 };
              start.year = minDateToDisplay.getFullYear();
              start.month = minDateToDisplay.getMonth();
              return start;
          };
          CrCalendar.prototype.nextGroup = function () {
              var newDate = new Date(this.start.year, this.start.month + this.monthCount, 1, 4);
              this.start = this.computeNextStart(newDate);
              this.refresh();
          };
          CrCalendar.prototype.nextMonth = function () {
              var newDate = new Date(this.start.year, this.start.month + 1, 1, 4);
              this.start = this.computeNextStart(newDate);
              this.refresh();
          };
          CrCalendar.prototype.computeNextStart = function (date) {
              var start = { year: 0, month: 0 };
              var maxKey = this.model.lastKey;
              var maxKeySplited = helper_5.CString.splitDate(maxKey);
              var maxDate = new Date(maxKeySplited.year, maxKeySplited.month + 1 - this.monthCount, 1, 4);
              var maxDateToDisplay = (date.getTime() < maxDate.getTime()) ? date : maxDate;
              start.year = maxDateToDisplay.getFullYear();
              start.month = maxDateToDisplay.getMonth();
              return start;
          };
          CrCalendar.prototype.triggerEvents = function () {
              var _this = this;
              var el = this.view.container.get(0);
              if (el) {
                  el.addEventListener("click", function (e) { return _this.click(e); }, false);
              }
          };
          CrCalendar.prototype.click = function (e) {
              var el = e.target;
              el = helper_6.CDom.clickHandler(el);
              if (el) {
                  switch (helper_6.CDom.dataClick(el)) {
                      case "previous-group":
                          this.previousGroup();
                          break;
                      case "previous-month":
                          this.previousMonth();
                          break;
                      case "next-month":
                          this.nextMonth();
                          break;
                      case "next-group":
                          this.nextGroup();
                          break;
                  }
              }
          };
          CrCalendar.prototype.dataLocation = function (dataid) {
              var location = this.params.dataRoot;
              return "" + location + dataid + "?" + (new Date().getTime());
          };
          CrCalendar.prototype.show = function () {
              var _this = this;
              var self = this;
              var _data;
              try {
                  self.model.getPeriods(this.dataLocation(this.params.periods))
                      .then(function () {
                      return self.model.getAvailabilities(_this.dataLocation(_this.params.availabilities));
                  })
                      .then(function () {
                      _data = self.model.data(self.start, self.monthCount);
                      return self.model.getLegend(_this.dataLocation(_this.params.legend));
                  })
                      .then(function (result) {
                      self.view.draw(_data, result);
                      self.triggerEvents();
                  })
                      .catch(function (e) {
                      new message_1.CMessage().error(messages_1.messagesfr, Error(e));
                  });
              }
              catch (e) {
                  new message_1.CMessage().error(messages_1.messagesfr, e);
              }
          };
          CrCalendar.prototype.dayArrivalSelectable = function (date) {
              var configDay = this.getDateConfigDay(date);
              /**
               * configDay
                      {typeMorning: "highless", typeAfternoon: "highless", rent: true, start: true}
                      {typeMorning: "highless", typeAfternoon: "highless", rent: true, end: true}
                      {typeMorning: "highless", typeAfternoon: "highless", rent: true, end: true,start:true}
                      {typeMorning: "highless", typeAfternoon: "highless", start: true}
                      {typeMorning: "highless", typeAfternoon: "highless", end: true}
                      {typeMorning: "highless", typeAfternoon: "highless"}
               */
              var selectable = !configDay.overDate && (!configDay.rent || (!configDay.start && configDay.end));
              var css = selectable ? configDay.typeAfternoon : "";
              return [selectable, css, ""];
          };
          CrCalendar.prototype.dayDepartureSelectable = function (date) {
              var configDay = this.getDateConfigDay(date);
              var selectable = !configDay.overDate && (!configDay.rent || (!configDay.end && configDay.start));
              var css = selectable ? configDay.typeMorning : "";
              return [selectable, css, ""];
          };
          CrCalendar.prototype.getDateConfigDay = function (date) {
              var data = this.model.datas;
              var stringDate = helper_7.CDate.getKey(date);
              var configDay = data[stringDate];
              return configDay;
          };
          CrCalendar.prototype.refresh = function () {
              var _data = this.model.dataReduce(this.start, this.monthCount);
              this.view.monthContentDraw(_data);
          };
          return CrCalendar;
      }());
      exports.CrCalendar = CrCalendar;
      function calendarFactory() {
          jQuery(".sf-calendar").each(function (index, el) {
              var $container = jQuery(el);
              var params = $container.data("params");
              var cal = new CrCalendar($container, params);
              cal.show();
          });
      }
      exports.calendarFactory = calendarFactory;
      function calendar(id) {
          var $container = jQuery("#" + id);
          if ($container.length == 0)
              return null;
          var params = $container.data("params");
          var cal = new CrCalendar($container, params);
          cal.show();
          return cal;
      }
      exports.calendar = calendar;
  });
  define("slideShow/model", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      /**
       Gestion de données
       */
      var CSModel = /** @class */ (function () {
          function CSModel(imageRoot) {
              this._data = [];
              this._imageRoot = imageRoot;
          }
          /**
           * Aquisition des données json  (sliderShow.json)
           * @param id @type {string} @returns Promise
           */
          CSModel.prototype.requestdata = function (id, dataLocation, data) {
              var self = this;
              try {
                  return new Promise(function (resolve, reject) {
                      self.updateData(resolve, reject, id, dataLocation, data);
                  });
              }
              catch (e) {
                  throw Error("Promise");
              }
          };
          CSModel.prototype.updateData = function (resolve, reject, id, dataLocation, data) {
              var self = this;
              var location;
              if (dataLocation) {
                  jQuery.getJSON(dataLocation + "?" + (new Date().getTime()), function (data) {
                      self._data = id ? self.setImagesUrl(data[id]) : self.setImagesUrl(data);
                      resolve(self.data);
                  }).fail(function () { return reject("slideShow"); });
              }
              else if (data) {
                  self._data = id ? self.setImagesUrl(data[id]) : self.setImagesUrl(data);
              }
              else {
                  reject("slideShow");
              }
          };
          Object.defineProperty(CSModel.prototype, "data", {
              get: function () {
                  return this._data;
              },
              enumerable: true,
              configurable: true
          });
          Object.defineProperty(CSModel.prototype, "length", {
              get: function () {
                  return this.data.length;
              },
              enumerable: true,
              configurable: true
          });
          CSModel.prototype.setImagesUrl = function (data) {
              var self = this;
              return data.map(function (obj) {
                  obj.url = self._imageRoot + obj.name;
                  return obj;
              });
          };
          return CSModel;
      }());
      exports.CSModel = CSModel;
  });
  define("slideShow/view", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var CSlideView = /** @class */ (function () {
          function CSlideView(container) {
              this._$container = container;
              this._$slide = jQuery("");
              this._$thumbnails = jQuery("");
              this._$thumbnailContainer = jQuery("");
              this._$thumbnailsRow = jQuery("");
              this._params = { showCaption: true, showThumbnail: true, current: 0 };
          }
          CSlideView.prototype.draw = function (params, data) {
              this._$slide.empty();
              this._$thumbnails.empty();
              this._params = params;
              this._$slide = this.buildSlide(data[this._params.current], this._params.current, data.length, this._params.showCaption);
              this._$container.append(this._$slide);
              if (this._params.showThumbnail) {
                  this._$thumbnails = this.buildThumbnails(this._params.current, data);
                  this._$container.append(this._$thumbnails);
                  var $img = jQuery(".sf-slide-thumbnail-column", this._$thumbnailsRow);
                  var imgWidth = $img.width() || 0;
                  this._$thumbnailsRow.width((imgWidth * data.length) + data.length * 2);
              }
          };
          Object.defineProperty(CSlideView.prototype, "container", {
              get: function () {
                  return this._$container;
              },
              enumerable: true,
              configurable: true
          });
          CSlideView.prototype.getThumbnailPosition = function (index) {
              return jQuery(".sf-slide-thumbnail-column[data-index=\"" + index + "\"]", this._$thumbnails).position().left;
          };
          CSlideView.prototype.getThumbnailWidth = function (index) {
              return jQuery(".sf-slide-thumbnail-column[data-index=\"" + index + "\"]", this._$thumbnails).width() || 0;
          };
          CSlideView.prototype.isThumbnailVisible = function (index) {
              var visible = true;
              var position = this.getThumbnailPosition(index);
              var width = this.getThumbnailWidth(index);
              if ((position < Math.abs(this.rowLeft)) ||
                  (position + width) > Math.abs(this.rowLeft) + this.containerWidth) {
                  visible = false;
              }
              return visible;
          };
          CSlideView.prototype.showThumbNail = function (index) {
              if (this._params.showThumbnail && !this.isThumbnailVisible(index)) {
                  var position = Math.max(this.centerThumbnail(index), 0);
                  position = Math.min(position, (this.rowWidth - this.containerWidth));
                  this.rowLeft = -position;
                  return -position;
              }
              return this.rowLeft;
          };
          CSlideView.prototype.centerThumbnail = function (index) {
              var position = this.getThumbnailPosition(index);
              var width = this.getThumbnailWidth(index);
              position = position + (width / 2) - (this.containerWidth / 2);
              return position;
          };
          //Move left move right depending on button clicked
          CSlideView.prototype.moveThumbNails = function (moveLeft) {
              if (!this._params.showThumbnail)
                  return 0;
              var value = this.containerWidth;
              var left = this.rowLeft;
              var newLeft = 0;
              if (moveLeft) {
                  if (Math.abs(left) + value + this.containerWidth > this.rowWidth) {
                      value = (this.rowWidth + left - this.containerWidth);
                  }
                  newLeft = left - value;
              }
              else {
                  if (left + value >= 0) {
                      left = 0;
                      value = 0;
                  }
                  newLeft = left + value;
              }
              this.rowLeft = newLeft;
              return newLeft;
          };
          CSlideView.prototype.refresh = function (data, length, index) {
              var showCaption = this._params.showCaption;
              var showThumbnail = this._params.showThumbnail;
              var img1 = jQuery("img.sf-img-slide-0", this._$slide);
              var img2 = jQuery("img.sf-img-slide-1", this._$slide);
              var current = img1;
              var next = img2;
              if (img1.css("opacity") == "0") {
                  current = img2;
                  next = img1;
              }
              next.attr("src", data.url);
              next.css("opacity", 1);
              current.css("opacity", 0);
              jQuery(".sf-numbertext", this._$slide).html(this.formatNumberText(index, length));
              if (showCaption) {
                  jQuery(".sf-slide-caption", this._$slide).html(data.caption);
              }
              if (showThumbnail) {
                  jQuery(".sf-slide-thumbnail-column", this._$thumbnails).removeClass("sf-current");
                  jQuery(".sf-slide-thumbnail-column[data-index=\"" + index + "\"]", this._$thumbnails).addClass("sf-current");
              }
          };
          CSlideView.prototype.buildSlide = function (value, current, count, showCaption) {
              var el = "<div class=\"sf-slide\">" + this.slideContent(value, current, count, showCaption) + "</div>";
              return jQuery(el);
          };
          CSlideView.prototype.formatNumberText = function (current, count) {
              return (current + 1) + "/" + count;
          };
          CSlideView.prototype.slideContent = function (value, current, count, showCaption) {
              var el = "<div class=\"sf-img-container-slide\"><img class=\"sf-img-slide-0\" src=\"" + value.url + "\">";
              el += "<img style=\"opacity:0\" class=\"sf-img-slide-1\" src=\"" + value.url + "\"></div>";
              el += "<div class=\"sf-numbertext\">" + this.formatNumberText(current, count) + "</div>";
              el += "<div class=\"sf-slide-btn-left\" data-click=\"slide-left\" style=\"visibility:hidden\"></div>";
              el += "<div class=\"sf-slide-btn-right\" data-click=\"slide-right\" style=\"visibility:hidden\"></div>";
              if (showCaption) {
                  el += "<div class=\"sf-slide-caption\">" + value.caption + "</div>";
              }
              return el;
          };
          CSlideView.prototype.buildThumbnails = function (current, data) {
              var self = this;
              var $navContainer = jQuery('<div class="sf-thumbnail"></div>');
              $navContainer.append(this.thumbnailButtons());
              this._$thumbnailContainer = jQuery('<div class="sf-thumbnail-container"></div>');
              this._$thumbnailsRow = jQuery('<div class="sf-slide-thunbnail-row"></div>');
              data.forEach(function (value, index) {
                  self._$thumbnailsRow.append(self.buildThumbnail(value, index, current));
              });
              this._$thumbnailContainer.append(self._$thumbnailsRow);
              $navContainer.append(this._$thumbnailContainer);
              return $navContainer;
          };
          Object.defineProperty(CSlideView.prototype, "rowWidth", {
              get: function () {
                  if (!this._params.showThumbnail)
                      return 0;
                  return this._$thumbnailsRow.width() || 0;
              },
              enumerable: true,
              configurable: true
          });
          Object.defineProperty(CSlideView.prototype, "rowLeft", {
              get: function () {
                  if (!this._params.showThumbnail)
                      return 0;
                  var left = parseFloat(this._$thumbnailsRow.css("left"));
                  if (left < 0)
                      left -= 0.01;
                  return left;
              },
              set: function (value) {
                  if (this._params.showThumbnail)
                      this._$thumbnailsRow.css("left", (value) + "px");
              },
              enumerable: true,
              configurable: true
          });
          Object.defineProperty(CSlideView.prototype, "containerWidth", {
              get: function () {
                  if (!this._params.showThumbnail)
                      return 0;
                  return this._$thumbnailContainer.width() || 0;
              },
              enumerable: true,
              configurable: true
          });
          CSlideView.prototype.buildThumbnail = function (image, index, current) {
              var el = "<div class=\"sf-slide-thumbnail-column " + ((current == index) ? 'current' : '') + "\"";
              el += " data-click=\"thumbnail\" data-index=" + index + " title=\"" + image.caption + "\" alt=\"" + image.caption + "\"";
              el += " style=\"background-image:url(" + image.url + ")\">";
              return jQuery(el);
          };
          CSlideView.prototype.thumbnailButtons = function () {
              var btns = '<div class="sf-thumbnail-btns">';
              btns += '<div class="sf-thumbnail-btn-left" data-click="thumbnails-left" style="visibility:hidden"><i class="sf-icon-angle-left"></i></div>';
              btns += '<div class="sf-thumbnail-btn-right" data-click="thumbnails-right" style="visibility:hidden"><i class="sf-icon-angle-right"></i></div>';
              btns += '</div>';
              return jQuery(btns);
          };
          CSlideView.prototype.thumbnailBtnsVisibility = function (left, right) {
              if (this._params.showThumbnail) {
                  jQuery(".sf-thumbnail-btn-left", this._$thumbnails).css("visibility", left);
                  jQuery('.sf-thumbnail-btn-right', this._$thumbnails).css("visibility", right);
              }
          };
          CSlideView.prototype.slideBtnsVisibility = function (left, right) {
              jQuery(".sf-slide-btn-left", this._$slide).css("visibility", left);
              jQuery('.sf-slide-btn-right', this._$slide).css("visibility", right);
          };
          return CSlideView;
      }());
      exports.CSlideView = CSlideView;
  });
  define("slideShow/messages", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.messagesfr = {
          "Header": "Le slider ne peut pas être affiché.",
          "Promise": ["Votre navigateur ne prend pas en charge certaines fonctionnalités indispensables.",
              "Merci d'utiliser un navigateur plus récent."],
          "slideShow": ["Impossible de trouver la liste des images à afficher.", "Vérifiez les paramètres du composant (data-params)"]
      };
  });
  define("slideShow/controller", ["require", "exports", "slideShow/view", "slideShow/model", "slideShow/messages", "helpers/message", "helpers/helper"], function (require, exports, view_2, model_2, messages_2, message_2, helper_8) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var CSlideShow = /** @class */ (function () {
          function CSlideShow($container, params) {
              this._currentIndex = 0;
              this._id = $container.attr("id") || "";
              this._params = params;
              this._view = new view_2.CSlideView($container);
              this._model = new model_2.CSModel(this._params.imageRoot);
              $container.removeAttr("data-params");
          }
          CSlideShow.prototype.triggerEvents = function () {
              var _this = this;
              var el = this._view.container.get(0);
              if (el) {
                  el.addEventListener("click", function (e) { return _this.click(e); }, false);
              }
          };
          CSlideShow.prototype.click = function (e) {
              var el = e.target;
              el = helper_8.CDom.clickHandler(el);
              if (el) {
                  switch (helper_8.CDom.dataClick(el)) {
                      case "slide-left":
                          this.clickSlideBtns(-1);
                          break;
                      case "slide-right":
                          this.clickSlideBtns(1);
                          break;
                      case "thumbnails-right":
                          this.clickThumbernailBtns(true);
                          break;
                      case "thumbnails-left":
                          this.clickThumbernailBtns(false);
                          break;
                      case "thumbnail":
                          this.clickThumbnail(parseInt(el.getAttribute("data-index") || "0", 10));
                          break;
                  }
              }
          };
          CSlideShow.prototype.clickSlideBtns = function (progress) {
              var self = this;
              var index = self._currentIndex;
              index += progress;
              self.changeSlide(index);
              var newLeft = self._view.showThumbNail(index);
              self.btnsState(newLeft);
          };
          CSlideShow.prototype.clickThumbnail = function (index) {
              var self = this;
              self.changeSlide(index);
              self.btnsState(self._view.rowLeft);
          };
          CSlideShow.prototype.clickThumbernailBtns = function (right) {
              var self = this;
              var newLeft = 0;
              newLeft = self._view.moveThumbNails(right);
              self.btnsState(newLeft);
          };
          CSlideShow.prototype.btnsState = function (rowLeft) {
              var left = (rowLeft >= 0) ? "hidden" : "visible";
              var right = (-rowLeft + this._view.containerWidth >= this._view.rowWidth) ? "hidden" : "visible";
              this._view.thumbnailBtnsVisibility(left, right);
              left = (this._currentIndex == 0) ? "hidden" : "visible";
              right = (this._currentIndex == this._model.length - 1) ? "hidden" : "visible";
              this._view.slideBtnsVisibility(left, right);
          };
          CSlideShow.prototype.changeSlide = function (index) {
              this._currentIndex = Math.max(index, 0) && Math.min(index, this._model.length - 1);
              this._view.refresh(this._model.data[this._currentIndex], this._model.length, this._currentIndex);
          };
          CSlideShow.prototype.show = function () {
              var self = this;
              try {
                  self._model.requestdata(self._params.dataid, self._params.dataLocation)
                      .then(function (result) {
                      var viewParams = { current: 0, showThumbnail: self._params.showThumbnail, showCaption: self._params.showCaption };
                      self._view.draw(viewParams, result);
                      self.triggerEvents();
                      self.btnsState(0);
                  })
                      .catch(function (e) {
                      new message_2.CMessage().error(messages_2.messagesfr, Error(e));
                  });
              }
              catch (e) {
                  new message_2.CMessage().error(messages_2.messagesfr, e);
              }
          };
          return CSlideShow;
      }());
      exports.CSlideShow = CSlideShow;
      function slideShowFactory() {
          jQuery(".sf-slideShow").each(function (index, el) {
              var $container = jQuery(el);
              var params = $container.data("params");
              var slideShow = new CSlideShow($container, params);
              slideShow.show();
          });
      }
      exports.slideShowFactory = slideShowFactory;
      function slideShow(id) {
          var $container = jQuery("#" + id);
          if ($container.length > 0) {
              var params = $container.data("params");
              var slideShow_1 = new CSlideShow($container, params);
              slideShow_1.show();
          }
      }
      exports.slideShow = slideShow;
  });
  define("tabsection/controller", ["require", "exports", "helpers/helper"], function (require, exports, helper_9) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      /**
       * params{
       *  scrollTop:boolean,
       *  close : boolean
       * }
       */
      var CLinkSection = /** @class */ (function () {
          function CLinkSection(params, classCss) {
              this.$sectionList = jQuery("." + classCss);
              this.$container = jQuery("<div class=\"" + classCss + "-tabs\"></div>");
          }
          Object.defineProperty(CLinkSection.prototype, "list", {
              get: function () {
                  return this.$sectionList;
              },
              enumerable: true,
              configurable: true
          });
          Object.defineProperty(CLinkSection.prototype, "container", {
              get: function () {
                  return this.$container;
              },
              enumerable: true,
              configurable: true
          });
          CLinkSection.prototype.triggerEvents = function () {
              var _this = this;
              this.container.get(0).addEventListener("click", function (e) { return _this.click(e); }, false);
          };
          CLinkSection.prototype.click = function (e) {
              var el = e.target;
              el = helper_9.CDom.clickHandler(el);
              if (el)
                  this.doClick(el);
          };
          CLinkSection.prototype.doClick = function (el) {
              if (helper_9.CDom.dataClick(el) === "tab")
                  this.clickTab(jQuery(el).data("index"));
          };
          CLinkSection.prototype.clickTab = function (sindex) {
              var index = parseInt(sindex, 10) || 0;
              var $el = jQuery(this.list[index]);
              var delatPaddingMargin = parseInt($el.css("margin-top"), 10) + parseInt($el.css("padding-top"), 10);
              var position = $el.offset();
              var delta = (((this.container && this.container.height()) || 0) + 6);
              this.scrollTo(position.top - delta + delatPaddingMargin - 2);
          };
          CLinkSection.prototype.scrollTo = function (position) {
              jQuery("body, html").animate({ scrollTop: position }, 700);
          };
          return CLinkSection;
      }());
      var CPanelSection = /** @class */ (function (_super) {
          __extends(CPanelSection, _super);
          function CPanelSection(params, classCss) {
              if (classCss === void 0) { classCss = "sf-panel"; }
              var _this = _super.call(this, params, classCss) || this;
              _this.panelClosed = false; /* fermeture explicite utilisateur*/
              _this.buttonSize = 30;
              _this.linkSizeMin = 90;
              _this.top = 0;
              if (_this.$sectionList.length >= 1) {
                  jQuery(document.body).append(_this.container);
                  var par = _this.getParams(params);
                  _this.linkSizeMin = par.minSize;
                  var $tabs = _this.buildTabs(classCss, par);
                  _this.container.append($tabs);
                  _this.top = (((_this.container && _this.container.height()) || 0) + 6);
                  var padding = _this.paddingRight($tabs, par.scrollTop, par.close);
                  $tabs.css("padding-right", padding + "px");
                  _this.triggerEvents();
              }
              _this.scroll();
              return _this;
          }
          ;
          CPanelSection.prototype.buildTabs = function (selector, params) {
              var _this = this;
              var content = "";
              var captions = this.widths();
              var lastIndex = 0;
              var buttonStyle = "";
              if (this.buttonSize)
                  buttonStyle = "style=\"width:" + this.buttonSize + "px\" ";
              this.list.each(function (index, el) {
                  var caption = _this.caption(el);
                  content += _this.link(selector, caption, index, captions);
                  lastIndex = index;
              });
              if (params.scrollTop) {
                  lastIndex++;
                  content += "<li class=\"" + selector + "-tab sf-btn-panel\" " + buttonStyle + " data-click=\"scrollTop\"><span style=\"width:" + this.buttonSize + "px\" class=\"sf-tab-scrollTop sf-icon-up-circled\"></span></li>";
              }
              if (params.close) {
                  lastIndex++;
                  content += "<li class=\"" + selector + "-tab sf-btn-panel\" " + buttonStyle + " data-click=\"close\"><span style=\"width:" + this.buttonSize + "px\" class=\"sf-tab-close sf-icon-cancel-circled\"></span></li>";
              }
              var tabs = "<div class=\"" + selector + "-tabs-panel\"><ul class=\"sf-tabs\">" + content + "</ul></div>";
              return jQuery(tabs);
          };
          CPanelSection.prototype.link = function (selector, caption, index, captions) {
              var link = "";
              var styleli = "";
              var stylespan = "";
              styleli = "style=\"width:" + (captions.width[index]) * 100 / captions.total + "%\"";
              stylespan = "style=\"width:" + captions.width[index] + "px\"";
              link = "<li class=\"" + selector + "-tab\" " + styleli + " data-click=\"tab\" data-index=\"" + index + "\"><span " + stylespan + " class=\"sf-tab-text\">" + caption + "</span></li>";
              return link;
          };
          CPanelSection.prototype.getParams = function (params) {
              var pars = { scrollTop: false, close: false, minSize: this.linkSizeMin, css: "" };
              if (params) {
                  pars.scrollTop = params ? params.scrollTop : false;
                  pars.close = params ? params.close : false;
                  pars.minSize = params.minSize ? params.minSize : this.linkSizeMin;
              }
              return pars;
          };
          CPanelSection.prototype.triggerEvents = function () {
              var _this = this;
              _super.prototype.triggerEvents.call(this);
              window.addEventListener("scroll", function (e) { return _this.scroll(); }, false);
          };
          CPanelSection.prototype.doClick = function (el) {
              _super.prototype.doClick.call(this, el);
              switch (helper_9.CDom.dataClick(el)) {
                  case "close":
                      this.panelClosed = true;
                      this.hide();
                      break;
                  case "scrollTop":
                      this.scrollTo(0);
                      break;
              }
          };
          CPanelSection.prototype.caption = function (el) {
              var $el = jQuery(el);
              var caption = $el.data("params") ? ($el.data("params").caption || $el.text()) : $el.text();
              return caption;
          };
          CPanelSection.prototype.scroll = function () {
              if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                  if (!this.panelClosed)
                      this.show();
              }
              else {
                  this.panelClosed = false;
                  this.hide();
              }
          };
          CPanelSection.prototype.widths = function () {
              var _this = this;
              var captions = { "width": [], "total": 0 };
              this.list.each(function (index, el) {
                  var $el = jQuery(el);
                  var caption = $el.data("params") ? ($el.data("params").caption || $el.text()) : $el.text();
                  captions.width.push(_this.captionSize(caption));
                  captions.total += captions.width[index];
              });
              return captions;
          };
          CPanelSection.prototype.paddingRight = function ($tabs, scrollTop, close) {
              var padding = (parseInt($tabs.css("padding-left"), 10) + this.$sectionList.length - 1);
              if (scrollTop)
                  padding += this.buttonSize + 1;
              if (close)
                  padding += this.buttonSize + 1;
              return padding;
          };
          CPanelSection.prototype.captionSize = function (caption) {
              var $el = jQuery("<span id=\"sf-sizing\"style=\"width:auto;box-sizing: border-box;\" class=\"sf-tab-text\">" + caption + "</span>");
              jQuery(document.body).append($el);
              var size = Math.max(($el.width() || 0) + 2, this.linkSizeMin);
              $el.remove();
              return size;
          };
          CPanelSection.prototype.hide = function () {
              if (this.container.position().top >= 0)
                  this.container.get(0).style.top = "-" + this.top + "px";
          };
          CPanelSection.prototype.show = function () {
              if (this.container.position().top < 0)
                  this.container.get(0).style.top = "0px";
          };
          return CPanelSection;
      }(CLinkSection));
      var CQuickLinks = /** @class */ (function (_super) {
          __extends(CQuickLinks, _super);
          function CQuickLinks(container, params, classCss) {
              if (classCss === void 0) { classCss = "sf-link"; }
              var _this = _super.call(this, params, classCss) || this;
              if (_this.$sectionList.length >= 1) {
                  var $tabs = _this.buildTabs(classCss, params);
                  _this.container.append($tabs);
                  _this.triggerEvents();
              }
              jQuery(document.body).append(_this.container);
              var $linksContainer = jQuery(container);
              if ($linksContainer.length > 0) {
                  $linksContainer.css("position", "relative");
                  $linksContainer.append(_this.container);
              }
              else {
              }
              return _this;
          }
          CQuickLinks.prototype.buildTabs = function (selector, params) {
              var _this = this;
              var content = "";
              var lastIndex = 0;
              this.list.each(function (index, el) {
                  var caption = _this.caption(el);
                  content += _this.link(selector, caption, index, _this.highlight(el));
                  lastIndex = index;
              });
              var tabs = "<div class=\"" + selector + "-tabs-panel\"><ul class=\"sf-tabs\">" + content + "</ul></div>";
              return jQuery(tabs);
          };
          CQuickLinks.prototype.link = function (selector, caption, index, highlight) {
              var link = "";
              var additionalCss = highlight ? " sf-highlight" : "";
              link = "<li class=\"" + selector + "-tab\" data-click=\"tab\" data-index=\"" + index + "\"><span class=\"sf-tab-text" + additionalCss + "\">" + caption + "<span class=\"sf-icon-level-down\"></span></span></li>";
              return link;
          };
          CQuickLinks.prototype.caption = function (el) {
              var $el = jQuery(el);
              var caption = $el.data("params") ? ($el.data("params").captionLink || $el.text()) : $el.text();
              return caption;
          };
          CQuickLinks.prototype.highlight = function (el) {
              var $el = jQuery(el);
              var highlight = $el.data("params") ? $el.data("params").highlight : false;
              return highlight;
          };
          return CQuickLinks;
      }(CLinkSection));
      function panelSectionFactory(params) {
          var tabS = new CPanelSection(params);
      }
      exports.panelSectionFactory = panelSectionFactory;
      function linkSectionFactory(container, params) {
          var containerSelector = container || ".sf-linksContainer";
          var position = params.position.split(",").join("-");
          var links = new CQuickLinks(container, params);
          links.container.addClass("sf-" + position);
      }
      exports.linkSectionFactory = linkSectionFactory;
  });
  define("imageZoom/controller", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var CImgZoom = /** @class */ (function () {
          function CImgZoom() {
              this.$container = null;
              this.$frame = null;
              if (CImgZoom._instance) {
                  throw new Error("Error: Instantiation failed: Use CImgZoom.getInstance() instead of new.");
              }
              CImgZoom._instance = this;
          }
          CImgZoom.getInstance = function () {
              return CImgZoom._instance;
          };
          CImgZoom.prototype.zoom = function ($img, maxWidth) {
              var self = this;
              if (this.$container) {
                  this.destroy();
              }
              if ($img) {
                  this.promiseImageSizes($img).then(function (sizes) {
                      self.$container = self.mainContainer();
                      self.$frame = self.frame(maxWidth ? Math.min(sizes.width, maxWidth) : sizes.width);
                      var $btnClose = self.closeButton();
                      self.$frame.append($btnClose);
                      self.$frame.append(self.cloneCleanImage($img));
                      self.$container.append(self.$frame);
                      var $body = jQuery("body");
                      $body.append(self.$container);
                      setTimeout(function () { if (self.$frame)
                          self.$frame.css("opacity", 1); }, 50);
                  });
              }
          };
          CImgZoom.prototype.mainContainer = function () {
              return jQuery("<div class=\"sf-imgzoom-container\"></div>");
          };
          CImgZoom.prototype.frame = function (width) {
              var $frame = jQuery("<div class=\"sf-image-frame\"></div>");
              $frame.css("max-width", width + "px");
              $frame.css("opacity", 0);
              return $frame;
          };
          CImgZoom.prototype.closeButton = function () {
              var _this = this;
              var $close = jQuery("<div class=\"sf-close-zoom\" data-click=\"zoom-close\"><span class=\"sf-close-zoom-btn sf-icon-cancel \"></span></div>");
              $close.get(0).addEventListener("click", function (e) { return _this.close(e); }, false);
              return $close;
          };
          CImgZoom.prototype.cloneCleanImage = function ($img) {
              var $imgResize = $img.clone();
              $imgResize.removeAttr("height").removeAttr("width").removeAttr("sizes").removeClass();
              $imgResize.addClass("sf-zoom-image");
              return $imgResize;
          };
          CImgZoom.prototype.promiseImageSizes = function ($img) {
              var self = this;
              try {
                  return new Promise(function (resolve, reject) {
                      var image = new Image();
                      image.src = $img.attr("src");
                      image.onload = function () { return resolve({ width: image.width, height: image.height }); };
                      image.onerror = function () { return reject("image"); };
                  });
              }
              catch (e) {
                  throw Error("Promise");
              }
          };
          CImgZoom.prototype.close = function (e) {
              var _this = this;
              if (this.$frame)
                  this.$frame.css("opacity", 0);
              setTimeout(function () { return _this.destroy(); }, 1000);
          };
          CImgZoom.prototype.destroy = function () {
              var _this = this;
              if (this.$frame)
                  this.$frame.remove();
              if (this.$container) {
                  this.$container.get(0).removeEventListener("click", function (e) { return _this.close(e); }, false);
                  this.$container.remove();
              }
              this.$container = null;
              this.$frame = null;
          };
          CImgZoom._instance = new CImgZoom();
          return CImgZoom;
      }());
      function triggerEvents($img, $trigger, maxWidth) {
          var $triggerElement = $trigger || $img;
          if ($triggerElement.length > 0)
              $triggerElement.get(0).addEventListener("click", function (e) { return CImgZoom.getInstance().zoom($img, maxWidth); }, false);
      }
      function toFrameImage($img, noicon, maxWidth) {
          var $btn = null;
          if (!noicon) {
              var $frame = jQuery("<div class=\"sf-frame-image\"></i></div>");
              $btn = jQuery("<span class=\"sf-zoom-open\"><i class=\"sf-icon-resize-full-2\"></i></span>");
              $frame.append($btn);
              $frame.insertBefore($img);
              $img.appendTo($frame);
          }
          triggerEvents($img, $btn, maxWidth);
      }
      function imageZoomFactory(maxWidth) {
          jQuery(".sf-imgZoom").each(function (index, el) {
              var $img = jQuery(el);
              var noicon = $img.hasClass("sf-noicon");
              toFrameImage($img, noicon, maxWidth);
          });
      }
      exports.imageZoomFactory = imageZoomFactory;
  });
  define("listes/controller", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var CList = /** @class */ (function () {
          function CList(typeList) {
              this.$list = jQuery(".sf-hierarchy." + typeList);
              this.$li = jQuery('li', this.$list);
              this.setLiContainer();
          }
          CList.prototype.setLiContainer = function () {
          };
          return CList;
      }());
      var CListFolder = /** @class */ (function (_super) {
          __extends(CListFolder, _super);
          function CListFolder(typeList) {
              return _super.call(this, typeList) || this;
          }
          CListFolder.prototype.setLiContainer = function () {
              this.$li.has("ul").addClass("sf-icon-folder-open sf-container");
              jQuery("li:not(:has(ul))", this.$list).addClass("sf-icon-doc sf-contents");
          };
          return CListFolder;
      }(CList));
      function listFolder() {
          var list = new CListFolder("sf-type-folder");
      }
      exports.listFolder = listFolder;
  });
  define("responsiveTopnav/controller", ["require", "exports", "helpers/helper"], function (require, exports, helper_10) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      /**
       * params{
       * }
       */
      var CResponsiveTopNav = /** @class */ (function () {
          function CResponsiveTopNav($menu, size) {
              this.$menu = $menu;
              this.$menu.addClass(size ? "sf-" + size : "");
              this.addIcon();
          }
          CResponsiveTopNav.prototype.addIcon = function () {
              this.$menu.append(this.getModel(this.$menu.is("ul")));
              this.triggerEvents();
          };
          CResponsiveTopNav.prototype.getModel = function (isList) {
              var icon = "<a  href=\"javascript:void(0)\" class=\"sf-icon-menu\" data-click=\"menuIcon\"></a>";
              var smodel = isList ? "<li class=\"sf-icon-menu-container\">" + icon + "</li>" : "" + icon;
              return smodel;
          };
          CResponsiveTopNav.prototype.triggerEvents = function () {
              var _this = this;
              this.$menu.get(0).addEventListener("click", function (e) { return _this.click(e); }, false);
          };
          CResponsiveTopNav.prototype.click = function (e) {
              var el = e.target;
              el = helper_10.CDom.clickHandler(el);
              if (el)
                  this.doClick(el);
          };
          CResponsiveTopNav.prototype.doClick = function (el) {
              if (helper_10.CDom.dataClick(el) === "menuIcon")
                  this.clickResponsive();
          };
          CResponsiveTopNav.prototype.clickResponsive = function () {
              this.$menu.toggleClass("sf-responsive");
          };
          return CResponsiveTopNav;
      }());
      function responsiveTopNavFactory(size) {
          jQuery(".sf-responsive-topnav").each(function (index, el) {
              new CResponsiveTopNav(jQuery(el), size);
          });
      }
      exports.responsiveTopNavFactory = responsiveTopNavFactory;
      function responsiveTopNav(key, size) {
          var $topNav = jQuery(key).addClass("sf-responsive-topnav");
          new CResponsiveTopNav($topNav, size);
      }
      exports.responsiveTopNav = responsiveTopNav;
  });
  define("w-siteFactory", ["require", "exports", "calendar/controller", "slideShow/controller", "helpers/message", "tabsection/controller", "imageZoom/controller", "listes/controller", "responsiveTopnav/controller"], function (require, exports, Calendar, SlideShow, message, Tabsection, ImgZoom, List, ResponsiveTopNav) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      function calendarFactory() {
          Calendar.calendarFactory();
      }
      exports.calendarFactory = calendarFactory;
      function calendar(id) {
          return Calendar.calendar(id);
      }
      exports.calendar = calendar;
      function slideShowFactory() {
          SlideShow.slideShowFactory();
      }
      exports.slideShowFactory = slideShowFactory;
      function slideShow(id) {
          SlideShow.slideShow(id);
      }
      exports.slideShow = slideShow;
      function info(content) {
          message.showInfo(content);
      }
      exports.info = info;
      function error(messages, error) {
          message.showError(messages, error);
      }
      exports.error = error;
      function panelSectionFactory(params) {
          Tabsection.panelSectionFactory(params);
      }
      exports.panelSectionFactory = panelSectionFactory;
      function linkSectionFactory(selector, params) {
          var par = params || { "postion": "center,center" };
          par.position = par.position ? par.position : "center,center";
          Tabsection.linkSectionFactory(selector, par);
      }
      exports.linkSectionFactory = linkSectionFactory;
      function imageZoomFactory(maxWidth) {
          ImgZoom.imageZoomFactory(maxWidth);
      }
      exports.imageZoomFactory = imageZoomFactory;
      function listFolder() {
          List.listFolder();
      }
      exports.listFolder = listFolder;
      function responsiveTopNavFactory(size) {
          ResponsiveTopNav.responsiveTopNavFactory(size);
      }
      exports.responsiveTopNavFactory = responsiveTopNavFactory;
      function responsiveTopNav(key, size) {
          ResponsiveTopNav.responsiveTopNav(key, size);
      }
      exports.responsiveTopNav = responsiveTopNav;
  });
  
  return collect(); 
})();