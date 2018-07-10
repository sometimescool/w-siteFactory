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

  define("helpers/helper", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class COrientation {
          constructor() {
              this.on = false;
              this.callBacks = new Map();
              if (COrientation._instance) {
                  throw new Error("Error: Instantiation failed: Use COrientation.getInstance() instead of new.");
              }
              this.orientation = this.getOrientation();
              COrientation._instance = this;
          }
          static getInstance() {
              return COrientation._instance;
          }
          triggerEvents() {
              window.addEventListener("resize", (e) => this.handleResize(e), false);
          }
          onOrientationChange(callback) {
              if (!this.on) {
                  this.triggerEvents();
                  this.on = true;
              }
              let _uuid = exports.UUID();
              this.callBacks.set(_uuid, callback);
              return _uuid;
          }
          removeOrientationChange(key) {
              if (this.callBacks.has(key)) {
                  this.callBacks.delete(key);
              }
          }
          handleResize(e) {
              clearTimeout(this.timer);
              this.timer = setTimeout((e) => this.reSize(e), COrientation.time);
          }
          reSize(e) {
              if (this.getOrientation() != this.orientation) {
                  let orientation = this.getOrientation();
                  this.orientation = orientation;
                  this.broadcast(orientation);
              }
          }
          broadcast(orientation) {
              this.callBacks.forEach((value, key, map) => { value(orientation); });
          }
          getOrientation() {
              return window.outerWidth > window.outerHeight ? COrientation.landscape : COrientation.portrait;
          }
      }
      COrientation.time = 100;
      COrientation.landscape = "landscape";
      COrientation.portrait = "portrait";
      COrientation._instance = new COrientation();
      exports.orientation = COrientation.getInstance();
      class CDom {
          static dataMouseMove(el) {
              let value = null;
              value = el.getAttribute("data-mouse-move");
              return value;
          }
          static dataClick(el) {
              let value = null;
              value = el.getAttribute("data-click");
              return value;
          }
          static clickHandler(el) {
              let elmt = el;
              while (elmt != null && !CDom.dataClick(elmt)) {
                  elmt = elmt.parentElement;
              }
              return elmt;
          }
          static mouseMoveHandler(el) {
              let elmt = el;
              while (elmt != null && !CDom.dataMouseMove(elmt)) {
                  elmt = elmt.parentElement;
              }
              return elmt;
          }
      }
      exports.CDom = CDom;
      class CString {
          static repeat(stringToRepeat, count) {
              let AString = [];
              let nRep = 0;
              while (nRep < count) {
                  AString.push(stringToRepeat);
              }
              return AString.join("");
          }
          static padStart(stringToPad, targetLength, padString) {
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
          }
          static split1Date(stringDate) {
              let keys = stringDate.split("-");
              let splittedKey = { "month": "", "day": "" };
              if (keys.length == 3) {
                  splittedKey.month = keys[0] + "-" + keys[1];
                  splittedKey.day = keys[2];
              }
              else {
                  throw new Error("Error String.split1Date format (nnnn-nn-nn): value " + stringDate);
              }
              return splittedKey;
          }
          static splitDate(stringDate) {
              let keys = stringDate.split("-");
              let splittedKey = { "year": 0, "month": 0, "day": 0 };
              if (keys.length == 3) {
                  splittedKey.year = parseInt(keys[0], 10);
                  splittedKey.month = parseInt(keys[1], 10) - 1;
                  splittedKey.day = parseInt(keys[2], 10);
              }
              else {
                  throw new Error("Error String.splitDate format (nnnn-nn-nn): value " + stringDate);
              }
              return splittedKey;
          }
      }
      exports.CString = CString;
      class CDate {
          /**
           * @param date type Date
           * @return  AAAA-MM-JJ
           */
          static getKey(date) {
              let sMonth = CString.padStart((date.getMonth() + 1) + "", 2, "0");
              let sDay = CString.padStart((date.getDate() + ""), 2, "0");
              return date.getFullYear() + "-" + sMonth + "-" + sDay;
          }
          /**
           * @param date type Date
           * @return day with monday as start week
           */
          static getFrenchDay(date) {
              let day = date.getDay();
              let frenchDay = (day == 0) ? 7 : day;
              frenchDay--;
              return frenchDay;
          }
          /**
           * @param date type Date
           * @return the day of the first date of the month
           */
          static getFrenchFirstDay(date) {
              let firstDate = new Date(date.getFullYear(), date.getMonth(), 1, 4);
              return CDate.getFrenchDay(firstDate);
          }
          /**
           * @param date type Date
           * @return  the week position in the month
           */
          static getFrenchWeekInMonth(date) {
              let numWeek = 0;
              return Math.floor((date.getDate() + CDate.getFrenchFirstDay(date) - 1) / 7);
          }
      }
      exports.CDate = CDate;
      exports.UUID = function () {
          return 'sf_xxxxxxxx-xxxxxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, c => {
              var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
          });
      };
  });
  define("calendar/view", ["require", "exports", "helpers/helper"], function (require, exports, helper_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      //Calendar view
      class CrView {
          constructor(container) {
              this._container = container;
              this.monthsContainer = jQuery("<div class='sf-months-container'></div>");
          }
          get header() {
              let html = [];
              html.push('<div class="sf-calendar-buttons">');
              html.push('<div class="sf-button-previous" data-click="previous-group"><i class="sf-icon-angle-double-left"></i></div>');
              html.push('<div class="sf-button-previous-month"  data-click="previous-month"><i class="sf-icon-angle-left"></i></div>');
              html.push('<div class="sf-button-next-month"  data-click="next-month"><i class="sf-icon-angle-right"></i></div>');
              html.push('<div class="sf-button-next"  data-click="next-group"><i class="sf-icon-angle-double-right"></i></div>');
              html.push('</div>');
              return jQuery(html.join(""));
          }
          footer(legend) {
              let footer = jQuery("<div class='sf-calendar-footer'></div>");
              footer.append("<div class='sf-calendar-legend'><div class='sf-rented sf-icon-legend'></div>Non disponible</div>");
              footer.append("<div class='sf-calendar-legend'><div class='sf-notinit sf-icon-legend'></div>Fermé</div>");
              for (let key in legend) {
                  let sfCssClass = `sf-${key}`;
                  footer.append(`<div class="sf-calendar-legend"><div class="${sfCssClass} sf-icon-legend"></div>${legend[key]}</div>`);
              }
              return footer;
          }
          get container() {
              return this._container;
          }
          draw(data, legend) {
              this.container.append(this.header);
              this.container.append(this.monthsContainer);
              this.container.append(this.footer(legend));
              this.monthContentDraw(data);
          }
          monthContentDraw(data) {
              this.monthsContainer.empty();
              for (let yearMonth in data) {
                  let year = parseInt(yearMonth.split("-")[0], 10);
                  let month = parseInt(yearMonth.split("-")[1], 10);
                  this.monthsContainer.append(this.buildMonth(year, month, data[yearMonth]));
              }
          }
          /* data :
      16:{type: "veryhigh"}
      17:{type: "veryhigh", rent: true, start: true}
      18:{type: "veryhigh", rent: true}
      ...
      24:{type: "veryhigh", rent: true, end: true, start: true}
      */
          buildMonth(year, month, data) {
              let label = this.monthLabel(year, month);
              let content = jQuery('<div class="sf-layout-month">');
              content.append('<div class="sf-header-month">' + label + '</div>');
              let monthContent = jQuery('<table class="sf-month-content" cellspacing="0"></div>');
              monthContent.append("<tr><th>Lun</th><th>Mar</th><th>Mer</th><th>Jeu</th><th>Ven</th><th>Sam</th><th>Dim</th></tr>");
              content.append(monthContent);
              let noWeek = -1;
              let dayArray = [];
              let monthArray = [];
              let noDay;
              for (let length = data.length, i = 0; i < length; i++) {
                  let date = new Date(year, month - 1, parseInt(data[i].day, 10), 4);
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
          }
          initWeek() {
              return ['<tr>', this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), '</tr>'];
          }
          htmlDay(noDay, params) {
              let html = '';
              let cssCel = '';
              let rentedMorning = (params.rent && !params.start) || (params.rent && params.start && params.end);
              let rentedAfternoon = (params.rent && !params.end) || (params.rent && params.start && params.end);
              let cssMorning = "sf-calendar-day-morning " + (rentedMorning ? 'sf-rented' : params.typeMorning);
              let cssAfternoon = "sf-calendar-day-afternoon " + (rentedAfternoon ? 'sf-rented' : params.typeAfternoon);
              cssCel = ((rentedMorning && rentedAfternoon) || (params.typeMorning == " sf-notinit" && params.typeAfternoon == " sf-notinit")) ? " sf-notfree" : "";
              html = `<td class="sf-calendar-day${cssCel}">`;
              html += noDay;
              html += '<div class="' + cssMorning + '"></div>';
              html += '<div class="' + cssAfternoon + '"></div>';
              html += "</td>";
              return html;
          }
          monthLabel(year, month) {
              let index = month - 1;
              let label = ["Janvier", "F&eacute;vrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Ao&ucirc;t", "Septembre", "Octobre", "Novembre", "D&eacute;cembre"];
              return label[index] + " " + year;
          }
      }
      exports.CrView = CrView;
  });
  define("calendar/model", ["require", "exports", "helpers/helper", "helpers/helper"], function (require, exports, helper_2, helper_3) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class CrModel {
          constructor(dataid, dataRoot) {
              this.dataid = dataid;
              this._dataRoot = dataRoot;
              this._periods = null;
              this._availabilities = null;
              this._data = null;
              this._lastKey = "";
          }
          get lastKey() {
              return this._lastKey;
          }
          getPeriods(location) {
              let self = this;
              try {
                  return new Promise((resolve, reject) => {
                      if (self._periods) {
                          resolve();
                      }
                      else {
                          jQuery.getJSON(location, data => {
                              self._periods = data[self.dataid] || data;
                              resolve();
                          }).fail(() => reject("Periods"));
                      }
                  });
              }
              catch (e) {
                  throw Error("Promise");
              }
          }
          getAvailabilities(location) {
              let self = this;
              try {
                  return new Promise((resolve, reject) => {
                      if (self._availabilities) {
                          resolve();
                      }
                      else {
                          jQuery.getJSON(location, data => {
                              self._availabilities = data[self.dataid] || data;
                              resolve();
                          }).fail(() => reject("Availabilities"));
                      }
                  });
              }
              catch (e) {
                  throw Error("Promise");
              }
          }
          getLegend(location) {
              let self = this;
              try {
                  return new Promise((resolve, reject) => {
                      jQuery.getJSON(location, data => {
                          resolve(data[self.dataid] || data);
                      }).fail(() => reject("Legend"));
                  });
              }
              catch (e) {
                  throw Error("Promise");
              }
          }
          data(start, monthCount) {
              if (!this._data) {
                  //merge and reorganized datas
                  this._data = {};
                  this.buildPeriods();
                  this.buildAvailabilities();
              }
              ;
              return this.dataReduce(start, monthCount);
          }
          /* reduce data from start month to month count to display.
          called each time start month change*/
          dataReduce(start, monthCount) {
              let data = {};
              let dateStart = new Date(start.year, start.month, 1, 5);
              let dateEnd = new Date(start.year, start.month + monthCount, 0, 5);
              let startKey = helper_3.CDate.getKey(dateStart);
              let endKey = helper_3.CDate.getKey(dateEnd);
              let splittedKey;
              for (let monthDay in this._data) {
                  if (monthDay >= startKey && monthDay <= endKey) {
                      splittedKey = helper_2.CString.split1Date(monthDay);
                      data[splittedKey.month] = data[splittedKey.month] || [];
                      data[splittedKey.month].push({ "day": splittedKey.day, "data": this._data[monthDay] });
                  }
              }
              return data;
          }
          get datas() {
              return this._data;
          }
          //build periods for all datas
          buildPeriods() {
              let self = this;
              let lastKey = "";
              for (let year in self._periods) {
                  self._periods[year].forEach((elt) => {
                      let date = new Date(parseInt(year, 10), parseInt(elt.start.split("-")[0], 10) - 1, parseInt(elt.start.split("-")[1], 10));
                      let dateStart = new Date(parseInt(year, 10), parseInt(elt.start.split("-")[0], 10) - 1, parseInt(elt.start.split("-")[1], 10));
                      let dateEnd = new Date(parseInt(year, 10), parseInt(elt.end.split("-")[0], 10) - 1, parseInt(elt.end.split("-")[1], 10));
                      let keyToDay = helper_3.CDate.getKey(new Date());
                      while (date.getTime() <= dateEnd.getTime()) {
                          let key = helper_3.CDate.getKey(date);
                          if (key > lastKey)
                              lastKey = key;
                          self._data[key] = self._data[key] || {};
                          let startPeriod = (date.getTime() == dateStart.getTime());
                          let endPeriod = (date.getTime() == dateEnd.getTime());
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
              }
              self._lastKey = lastKey;
          }
          //build availabilities for all datas
          buildAvailabilities() {
              let self = this;
              for (let year in self._availabilities) {
                  self._availabilities[year].forEach((elt) => {
                      let date = new Date(parseInt(year, 10), parseInt(elt.start.split("-")[0], 10) - 1, parseInt(elt.start.split("-")[1], 10));
                      let dateEnd = new Date(parseInt(year, 10), parseInt(elt.end.split("-")[0], 10) - 1, parseInt(elt.end.split("-")[1], 10));
                      let dateStart = date;
                      while (date.getTime() <= dateEnd.getTime()) {
                          let key = helper_3.CDate.getKey(date);
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
              }
          }
      }
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
          let isHeader = (object !== undefined && object !== null && object.header !== undefined && object.header !== null && typeof object.header === "string");
          let isMessage = (object.message !== undefined && object.message !== null && object.message instanceof Array);
          return isHeader && isMessage;
      }
      class CMessage {
          constructor() {
              this.$frame = jQuery(`<div class="sf-message-box"></div>`);
          }
          messsageBoxList() {
              let $list = jQuery(".sf-message-box");
              return $list;
          }
          error(messages, error) {
              this.$frame.addClass("sf-error");
              this.show(this.message(messages, error));
          }
          info(content, code) {
              this.$frame.addClass("sf-info");
              this.show(this.message(content, code ? new Error(code) : undefined));
          }
          message(messages, error) {
              let messContent;
              let mess;
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
          }
          show(content) {
              let count = this.messsageBoxList().length;
              this.$frame.css("z-index", 1000 + count);
              let $header = this.header(content.header);
              let $frameContent = jQuery(`<div class="sf-message-content"></div>`);
              let strContent = "";
              content.message.forEach((line) => {
                  strContent += `<div class="sf-message-line">${line}</div>`;
              });
              $frameContent.append(jQuery(strContent));
              this.$frame.append(this.header(content.header));
              this.$frame.append($frameContent);
              let $body = jQuery("body");
              $body.append(this.$frame);
              let frameWidth = this.$frame.width() || 0;
              let width = ($body.width() || (frameWidth));
              let left = (width - frameWidth) / 2;
              this.$frame.css('left', (left + count * 20) + 'px');
              this.$frame.css('top', (20 + count * 40) + 'px');
              this.triggerEvent();
          }
          triggerEvent() {
              let el = this.$frame.get(0);
              if (el) {
                  el.addEventListener("click", (e) => this.click(e), false);
              }
          }
          click(e) {
              let el = e.target;
              el = helper_4.CDom.clickHandler(el);
              if (el) {
                  switch (helper_4.CDom.dataClick(el)) {
                      case "message-close":
                          this.destroy();
                          break;
                  }
              }
          }
          header(title) {
              let stringHeader = `<div class="sf-message-header"><div class="sf-message-title">${title}</div>`;
              stringHeader += `<div class="sf-close-popup" data-click="message-close"><i class="sf-icon-cancel"></i></div>`;
              stringHeader += `</div>`;
              return jQuery(stringHeader);
          }
          destroy() {
              let el = document.getElementById("sf-message");
              if (el) {
                  el.removeEventListener("click", (e) => this.click(e), false);
              }
              this.$frame.remove();
          }
      }
      exports.CMessage = CMessage;
      function showError(messages, error) {
          let mess = new CMessage().error(messages, error);
      }
      exports.showError = showError;
      function showInfo(content) {
          let mess = new CMessage().info(content);
      }
      exports.showInfo = showInfo;
  });
  define("calendar/controller", ["require", "exports", "calendar/view", "calendar/model", "calendar/messages", "helpers/message", "helpers/helper", "helpers/helper", "helpers/helper"], function (require, exports, view_1, model_1, messages_1, message_1, helper_5, helper_6, helper_7) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      // Calendar controller
      class CrCalendar {
          constructor($container, params) {
              this.params = params;
              this.monthCount = params.monthCount;
              this.start = { year: new Date().getFullYear(), month: new Date().getMonth() };
              this.model = new model_1.CrModel(params.dataid, params.dataRoot);
              this.view = new view_1.CrView($container);
              $container.removeAttr("data-params");
          }
          ;
          previousGroup() {
              let newDate = new Date(this.start.year, this.start.month - this.monthCount, 1, 5);
              this.start = this.computePreviousStart(newDate);
              this.refresh();
          }
          previousMonth() {
              let newDate = new Date(this.start.year, this.start.month - 1, 1, 5);
              this.start = this.computePreviousStart(newDate);
              this.refresh();
          }
          computePreviousStart(date) {
              let today = new Date();
              let minDateToDisplay = (date.getTime() < today.getTime()) ? today : date;
              let start = { year: 0, month: 0 };
              start.year = minDateToDisplay.getFullYear();
              start.month = minDateToDisplay.getMonth();
              return start;
          }
          nextGroup() {
              let newDate = new Date(this.start.year, this.start.month + this.monthCount, 1, 4);
              this.start = this.computeNextStart(newDate);
              this.refresh();
          }
          nextMonth() {
              let newDate = new Date(this.start.year, this.start.month + 1, 1, 4);
              this.start = this.computeNextStart(newDate);
              this.refresh();
          }
          computeNextStart(date) {
              let start = { year: 0, month: 0 };
              let maxKey = this.model.lastKey;
              let maxKeySplited = helper_5.CString.splitDate(maxKey);
              let maxDate = new Date(maxKeySplited.year, maxKeySplited.month + 1 - this.monthCount, 1, 4);
              let maxDateToDisplay = (date.getTime() < maxDate.getTime()) ? date : maxDate;
              start.year = maxDateToDisplay.getFullYear();
              start.month = maxDateToDisplay.getMonth();
              return start;
          }
          triggerEvents() {
              let el = this.view.container.get(0);
              if (el) {
                  el.addEventListener("click", (e) => this.click(e), false);
              }
          }
          click(e) {
              let el = e.target;
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
          }
          dataLocation(dataid) {
              let location = this.params.dataRoot;
              return `${location}${dataid}?${(new Date().getTime())}`;
          }
          show() {
              let self = this;
              let _data;
              try {
                  self.model.getPeriods(this.dataLocation(this.params.periods))
                      .then(() => {
                      return self.model.getAvailabilities(this.dataLocation(this.params.availabilities));
                  })
                      .then(() => {
                      _data = self.model.data(self.start, self.monthCount);
                      return self.model.getLegend(this.dataLocation(this.params.legend));
                  })
                      .then((result) => {
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
          }
          dayArrivalSelectable(date) {
              let configDay = this.getDateConfigDay(date);
              /**
               * configDay
                      {typeMorning: "highless", typeAfternoon: "highless", rent: true, start: true}
                      {typeMorning: "highless", typeAfternoon: "highless", rent: true, end: true}
                      {typeMorning: "highless", typeAfternoon: "highless", rent: true, end: true,start:true}
                      {typeMorning: "highless", typeAfternoon: "highless", start: true}
                      {typeMorning: "highless", typeAfternoon: "highless", end: true}
                      {typeMorning: "highless", typeAfternoon: "highless"}
               */
              let selectable = !configDay.overDate && (!configDay.rent || (!configDay.start && configDay.end));
              let css = selectable ? configDay.typeAfternoon : "";
              return [selectable, css, ""];
          }
          dayDepartureSelectable(date) {
              let configDay = this.getDateConfigDay(date);
              let selectable = !configDay.overDate && (!configDay.rent || (!configDay.end && configDay.start));
              let css = selectable ? configDay.typeMorning : "";
              return [selectable, css, ""];
          }
          getDateConfigDay(date) {
              let data = this.model.datas;
              let stringDate = helper_7.CDate.getKey(date);
              let configDay = data[stringDate];
              return configDay;
          }
          refresh() {
              let _data = this.model.dataReduce(this.start, this.monthCount);
              this.view.monthContentDraw(_data);
          }
      }
      exports.CrCalendar = CrCalendar;
      function calendarFactory() {
          jQuery(".sf-calendar").each((index, el) => {
              let $container = jQuery(el);
              let params = $container.data("params");
              let cal = new CrCalendar($container, params);
              cal.show();
          });
      }
      exports.calendarFactory = calendarFactory;
      function calendar(id) {
          let $container = jQuery(`#${id}`);
          if ($container.length == 0)
              return null;
          let params = $container.data("params");
          let cal = new CrCalendar($container, params);
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
      class CSModel {
          constructor(imageRoot) {
              this._data = [];
              this._imageRoot = imageRoot;
          }
          /**
           * Aquisition des données json  (sliderShow.json)
           * @param id @type {string} @returns Promise
           */
          requestdata(id, dataLocation, data) {
              let self = this;
              try {
                  return new Promise((resolve, reject) => {
                      self.updateData(resolve, reject, id, dataLocation, data);
                  });
              }
              catch (e) {
                  throw Error("Promise");
              }
          }
          updateData(resolve, reject, id, dataLocation, data) {
              let self = this;
              let location;
              if (dataLocation) {
                  jQuery.getJSON(dataLocation + "?" + (new Date().getTime()), data => {
                      self._data = id ? self.setImagesUrl(data[id]) : self.setImagesUrl(data);
                      resolve(self.data);
                  }).fail(() => reject("slideShow"));
              }
              else if (data) {
                  self._data = id ? self.setImagesUrl(data[id]) : self.setImagesUrl(data);
              }
              else {
                  reject("slideShow");
              }
          }
          get data() {
              return this._data;
          }
          get length() {
              return this.data.length;
          }
          setImagesUrl(data) {
              var self = this;
              return data.map((obj) => {
                  obj.url = self._imageRoot + obj.name;
                  return obj;
              });
          }
      }
      exports.CSModel = CSModel;
  });
  define("slideShow/view", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class CSlideView {
          constructor(container) {
              this._$container = container;
              this._$slide = jQuery("");
              this._$thumbnails = jQuery("");
              this._$thumbnailContainer = jQuery("");
              this._$thumbnailsRow = jQuery("");
              this._params = { showCaption: true, showThumbnail: true, current: 0 };
          }
          draw(params, data) {
              this._$slide.empty();
              this._$thumbnails.empty();
              this._params = params;
              this._$slide = this.buildSlide(data[this._params.current], this._params.current, data.length, this._params.showCaption);
              this._$container.append(this._$slide);
              if (this._params.showThumbnail) {
                  this._$thumbnails = this.buildThumbnails(this._params.current, data);
                  this._$container.append(this._$thumbnails);
                  let $img = jQuery(".sf-slide-thumbnail-column", this._$thumbnailsRow);
                  let imgWidth = $img.width() || 0;
                  this._$thumbnailsRow.width((imgWidth * data.length) + data.length * 2);
              }
          }
          get container() {
              return this._$container;
          }
          getThumbnailPosition(index) {
              return jQuery(`.sf-slide-thumbnail-column[data-index="${index}"]`, this._$thumbnails).position().left;
          }
          getThumbnailWidth(index) {
              return jQuery(`.sf-slide-thumbnail-column[data-index="${index}"]`, this._$thumbnails).width() || 0;
          }
          isThumbnailVisible(index) {
              let visible = true;
              let position = this.getThumbnailPosition(index);
              let width = this.getThumbnailWidth(index);
              if ((position < Math.abs(this.rowLeft)) ||
                  (position + width) > Math.abs(this.rowLeft) + this.containerWidth) {
                  visible = false;
              }
              return visible;
          }
          showThumbNail(index) {
              if (this._params.showThumbnail && !this.isThumbnailVisible(index)) {
                  let position = Math.max(this.centerThumbnail(index), 0);
                  position = Math.min(position, (this.rowWidth - this.containerWidth));
                  this.rowLeft = -position;
                  return -position;
              }
              return this.rowLeft;
          }
          centerThumbnail(index) {
              let position = this.getThumbnailPosition(index);
              let width = this.getThumbnailWidth(index);
              position = position + (width / 2) - (this.containerWidth / 2);
              return position;
          }
          //Move left move right depending on button clicked
          moveThumbNails(moveLeft) {
              if (!this._params.showThumbnail)
                  return 0;
              let value = this.containerWidth;
              let left = this.rowLeft;
              let newLeft = 0;
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
          }
          refresh(data, length, index) {
              let showCaption = this._params.showCaption;
              let showThumbnail = this._params.showThumbnail;
              let img1 = jQuery("img.sf-img-slide-0", this._$slide);
              let img2 = jQuery("img.sf-img-slide-1", this._$slide);
              let current = img1;
              let next = img2;
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
                  jQuery(`.sf-slide-thumbnail-column[data-index="${index}"]`, this._$thumbnails).addClass("sf-current");
              }
          }
          buildSlide(value, current, count, showCaption) {
              let el = `<div class="sf-slide">${this.slideContent(value, current, count, showCaption)}</div>`;
              return jQuery(el);
          }
          formatNumberText(current, count) {
              return `${(current + 1)}/${count}`;
          }
          slideContent(value, current, count, showCaption) {
              let el = `<div class="sf-img-container-slide"><img class="sf-img-slide-0" src="${value.url}">`;
              el += `<img style="opacity:0" class="sf-img-slide-1" src="${value.url}"></div>`;
              el += `<div class="sf-numbertext">${this.formatNumberText(current, count)}</div>`;
              el += `<div class="sf-slide-btn-left" data-click="slide-left" style="visibility:hidden"></div>`;
              el += `<div class="sf-slide-btn-right" data-click="slide-right" style="visibility:hidden"></div>`;
              if (showCaption) {
                  el += `<div class="sf-slide-caption">${value.caption}</div>`;
              }
              return el;
          }
          buildThumbnails(current, data) {
              let self = this;
              let $navContainer = jQuery('<div class="sf-thumbnail"></div>');
              $navContainer.append(this.thumbnailButtons());
              this._$thumbnailContainer = jQuery('<div class="sf-thumbnail-container"></div>');
              this._$thumbnailsRow = jQuery('<div class="sf-slide-thunbnail-row"></div>');
              data.forEach((value, index) => {
                  self._$thumbnailsRow.append(self.buildThumbnail(value, index, current));
              });
              this._$thumbnailContainer.append(self._$thumbnailsRow);
              $navContainer.append(this._$thumbnailContainer);
              return $navContainer;
          }
          get rowWidth() {
              if (!this._params.showThumbnail)
                  return 0;
              return this._$thumbnailsRow.width() || 0;
          }
          get rowLeft() {
              if (!this._params.showThumbnail)
                  return 0;
              let left = parseFloat(this._$thumbnailsRow.css("left"));
              if (left < 0)
                  left -= 0.01;
              return left;
          }
          set rowLeft(value) {
              if (this._params.showThumbnail)
                  this._$thumbnailsRow.css("left", (value) + "px");
          }
          get containerWidth() {
              if (!this._params.showThumbnail)
                  return 0;
              return this._$thumbnailContainer.width() || 0;
          }
          buildThumbnail(image, index, current) {
              let el = `<div class="sf-slide-thumbnail-column ${((current == index) ? 'current' : '')}"`;
              el += ` data-click="thumbnail" data-index=${index} title="${image.caption}" alt="${image.caption}"`;
              el += ` style="background-image:url(${image.url})">`;
              return jQuery(el);
          }
          thumbnailButtons() {
              let btns = '<div class="sf-thumbnail-btns">';
              btns += '<div class="sf-thumbnail-btn-left" data-click="thumbnails-left" style="visibility:hidden"><i class="sf-icon-angle-left"></i></div>';
              btns += '<div class="sf-thumbnail-btn-right" data-click="thumbnails-right" style="visibility:hidden"><i class="sf-icon-angle-right"></i></div>';
              btns += '</div>';
              return jQuery(btns);
          }
          thumbnailBtnsVisibility(left, right) {
              if (this._params.showThumbnail) {
                  jQuery(".sf-thumbnail-btn-left", this._$thumbnails).css("visibility", left);
                  jQuery('.sf-thumbnail-btn-right', this._$thumbnails).css("visibility", right);
              }
          }
          slideBtnsVisibility(left, right) {
              jQuery(".sf-slide-btn-left", this._$slide).css("visibility", left);
              jQuery('.sf-slide-btn-right', this._$slide).css("visibility", right);
          }
      }
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
      class CSlideShow {
          constructor($container, params) {
              this._currentIndex = 0;
              this._id = $container.attr("id") || "";
              this._params = params;
              this._view = new view_2.CSlideView($container);
              this._model = new model_2.CSModel(this._params.imageRoot);
              $container.removeAttr("data-params");
          }
          triggerEvents() {
              let el = this._view.container.get(0);
              if (el) {
                  el.addEventListener("click", (e) => this.click(e), false);
              }
          }
          click(e) {
              let el = e.target;
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
          }
          clickSlideBtns(progress) {
              let self = this;
              let index = self._currentIndex;
              index += progress;
              self.changeSlide(index);
              let newLeft = self._view.showThumbNail(index);
              self.btnsState(newLeft);
          }
          clickThumbnail(index) {
              let self = this;
              self.changeSlide(index);
              self.btnsState(self._view.rowLeft);
          }
          clickThumbernailBtns(right) {
              let self = this;
              let newLeft = 0;
              newLeft = self._view.moveThumbNails(right);
              self.btnsState(newLeft);
          }
          btnsState(rowLeft) {
              let left = (rowLeft >= 0) ? "hidden" : "visible";
              let right = (-rowLeft + this._view.containerWidth >= this._view.rowWidth) ? "hidden" : "visible";
              this._view.thumbnailBtnsVisibility(left, right);
              left = (this._currentIndex == 0) ? "hidden" : "visible";
              right = (this._currentIndex == this._model.length - 1) ? "hidden" : "visible";
              this._view.slideBtnsVisibility(left, right);
          }
          changeSlide(index) {
              this._currentIndex = Math.max(index, 0) && Math.min(index, this._model.length - 1);
              this._view.refresh(this._model.data[this._currentIndex], this._model.length, this._currentIndex);
          }
          show() {
              let self = this;
              try {
                  self._model.requestdata(self._params.dataid, self._params.dataLocation)
                      .then((result) => {
                      let viewParams = { current: 0, showThumbnail: self._params.showThumbnail, showCaption: self._params.showCaption };
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
          }
      }
      exports.CSlideShow = CSlideShow;
      function slideShowFactory() {
          jQuery(".sf-slideShow").each((index, el) => {
              let $container = jQuery(el);
              let params = $container.data("params");
              let slideShow = new CSlideShow($container, params);
              slideShow.show();
          });
      }
      exports.slideShowFactory = slideShowFactory;
      function slideShow(id) {
          let $container = jQuery(`#${id}`);
          if ($container.length > 0) {
              let params = $container.data("params");
              let slideShow = new CSlideShow($container, params);
              slideShow.show();
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
      class CLinkSection {
          constructor(params, classCss) {
              this.$sectionList = jQuery(`.${classCss}`);
              this.$container = jQuery(`<div class="${classCss}-tabs"></div>`);
          }
          get list() {
              return this.$sectionList;
          }
          get container() {
              return this.$container;
          }
          triggerEvents() {
              this.container.get(0).addEventListener("click", (e) => this.click(e), false);
          }
          click(e) {
              let el = e.target;
              el = helper_9.CDom.clickHandler(el);
              if (el)
                  this.doClick(el);
          }
          doClick(el) {
              if (helper_9.CDom.dataClick(el) === "tab")
                  this.clickTab(jQuery(el).data("index"));
          }
          clickTab(sindex) {
              let index = parseInt(sindex, 10) || 0;
              let $el = jQuery(this.list[index]);
              let delatPaddingMargin = parseInt($el.css("margin-top"), 10) + parseInt($el.css("padding-top"), 10);
              let position = $el.offset();
              let delta = (((this.container && this.container.height()) || 0) + 6);
              this.scrollTo(position.top - delta + delatPaddingMargin - 2);
          }
          scrollTo(position) {
              jQuery("body, html").animate({ scrollTop: position }, 700);
          }
      }
      class CPanelSection extends CLinkSection {
          constructor(params, classCss = "sf-panel") {
              super(params, classCss);
              this.panelClosed = false; /* fermeture explicite utilisateur*/
              this.buttonSize = 30;
              this.linkSizeMin = 90;
              this.top = 0;
              if (this.$sectionList.length >= 1) {
                  jQuery(document.body).append(this.container);
                  let par = this.getParams(params);
                  this.linkSizeMin = par.minSize;
                  let $tabs = this.buildTabs(classCss, par);
                  this.container.append($tabs);
                  this.top = (((this.container && this.container.height()) || 0) + 6);
                  let padding = this.paddingRight($tabs, par.scrollTop, par.close);
                  $tabs.css("padding-right", `${padding}px`);
                  this.triggerEvents();
              }
              this.scroll();
          }
          ;
          buildTabs(selector, params) {
              let content = "";
              let captions = this.widths();
              let lastIndex = 0;
              let buttonStyle = "";
              if (this.buttonSize)
                  buttonStyle = `style="width:${this.buttonSize}px" `;
              this.list.each((index, el) => {
                  let caption = this.caption(el);
                  content += this.link(selector, caption, index, captions);
                  lastIndex = index;
              });
              if (params.scrollTop) {
                  lastIndex++;
                  content += `<li class="${selector}-tab sf-btn-panel" ${buttonStyle} data-click="scrollTop"><span style="width:${this.buttonSize}px" class="sf-tab-scrollTop sf-icon-up-circled"></span></li>`;
              }
              if (params.close) {
                  lastIndex++;
                  content += `<li class="${selector}-tab sf-btn-panel" ${buttonStyle} data-click="close"><span style="width:${this.buttonSize}px" class="sf-tab-close sf-icon-cancel-circled"></span></li>`;
              }
              let tabs = `<div class="${selector}-tabs-panel"><ul class="sf-tabs">${content}</ul></div>`;
              return jQuery(tabs);
          }
          link(selector, caption, index, captions) {
              let link = "";
              let styleli = "";
              let stylespan = "";
              styleli = `style="width:${(captions.width[index]) * 100 / captions.total}%"`;
              stylespan = `style="width:${captions.width[index]}px"`;
              link = `<li class="${selector}-tab" ${styleli} data-click="tab" data-index="${index}"><span ${stylespan} class="sf-tab-text">${caption}</span></li>`;
              return link;
          }
          getParams(params) {
              let pars = { scrollTop: false, close: false, minSize: this.linkSizeMin, css: "" };
              if (params) {
                  pars.scrollTop = params ? params.scrollTop : false;
                  pars.close = params ? params.close : false;
                  pars.minSize = params.minSize ? params.minSize : this.linkSizeMin;
              }
              return pars;
          }
          triggerEvents() {
              super.triggerEvents();
              window.addEventListener("scroll", (e) => this.scroll(), false);
          }
          doClick(el) {
              super.doClick(el);
              switch (helper_9.CDom.dataClick(el)) {
                  case "close":
                      this.panelClosed = true;
                      this.hide();
                      break;
                  case "scrollTop":
                      this.scrollTo(0);
                      break;
              }
          }
          caption(el) {
              let $el = jQuery(el);
              let caption = $el.data("params") ? ($el.data("params").caption || $el.text()) : $el.text();
              return caption;
          }
          scroll() {
              if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                  if (!this.panelClosed)
                      this.show();
              }
              else {
                  this.panelClosed = false;
                  this.hide();
              }
          }
          widths() {
              let captions = { "width": [], "total": 0 };
              this.list.each((index, el) => {
                  let $el = jQuery(el);
                  let caption = $el.data("params") ? ($el.data("params").caption || $el.text()) : $el.text();
                  captions.width.push(this.captionSize(caption));
                  captions.total += captions.width[index];
              });
              return captions;
          }
          paddingRight($tabs, scrollTop, close) {
              let padding = (parseInt($tabs.css("padding-left"), 10) + this.$sectionList.length - 1);
              if (scrollTop)
                  padding += this.buttonSize + 1;
              if (close)
                  padding += this.buttonSize + 1;
              return padding;
          }
          captionSize(caption) {
              let $el = jQuery(`<span id="sf-sizing"style="width:auto;box-sizing: border-box;" class="sf-tab-text">${caption}</span>`);
              jQuery(document.body).append($el);
              let size = Math.max(($el.width() || 0) + 2, this.linkSizeMin);
              $el.remove();
              return size;
          }
          hide() {
              if (this.container.position().top >= 0)
                  this.container.get(0).style.top = `-${this.top}px`;
          }
          show() {
              if (this.container.position().top < 0)
                  this.container.get(0).style.top = `0px`;
          }
      }
      class CQuickLinks extends CLinkSection {
          constructor(container, params, classCss = "sf-link") {
              super(params, classCss);
              if (this.$sectionList.length >= 1) {
                  let $tabs = this.buildTabs(classCss, params);
                  this.container.append($tabs);
                  this.triggerEvents();
              }
              jQuery(document.body).append(this.container);
              let $linksContainer = jQuery(container);
              if ($linksContainer.length > 0) {
                  $linksContainer.css("position", "relative");
                  $linksContainer.append(this.container);
              }
              else {
              }
          }
          buildTabs(selector, params) {
              let content = "";
              let lastIndex = 0;
              this.list.each((index, el) => {
                  let caption = this.caption(el);
                  content += this.link(selector, caption, index, this.highlight(el));
                  lastIndex = index;
              });
              let tabs = `<div class="${selector}-tabs-panel"><ul class="sf-tabs">${content}</ul></div>`;
              return jQuery(tabs);
          }
          link(selector, caption, index, highlight) {
              let link = "";
              let additionalCss = highlight ? " sf-highlight" : "";
              link = `<li class="${selector}-tab" data-click="tab" data-index="${index}"><span class="sf-tab-text${additionalCss}">${caption}<span class="sf-icon-level-down"></span></span></li>`;
              return link;
          }
          caption(el) {
              let $el = jQuery(el);
              let caption = $el.data("params") ? ($el.data("params").captionLink || $el.text()) : $el.text();
              return caption;
          }
          highlight(el) {
              let $el = jQuery(el);
              let highlight = $el.data("params") ? $el.data("params").highlight : false;
              return highlight;
          }
      }
      function panelSectionFactory(params) {
          let tabS = new CPanelSection(params);
      }
      exports.panelSectionFactory = panelSectionFactory;
      function linkSectionFactory(container, params) {
          let containerSelector = container || ".sf-linksContainer";
          let position = params.position.split(",").join("-");
          let links = new CQuickLinks(container, params);
          links.container.addClass(`sf-${position}`);
      }
      exports.linkSectionFactory = linkSectionFactory;
  });
  define("imageZoom/controller", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class CImgZoom {
          constructor() {
              this.$container = null;
              this.$frame = null;
              this.$btnClose = null;
              if (CImgZoom._instance) {
                  throw new Error("Error: Instantiation failed: Use CImgZoom.getInstance() instead of new.");
              }
              CImgZoom._instance = this;
          }
          static getInstance() {
              return CImgZoom._instance;
          }
          zoom($img, maxWidth) {
              let self = this;
              if (this.$container) {
                  this.destroy();
              }
              if ($img) {
                  this.promiseImageSizes($img).then((sizes) => {
                      self.$container = self.mainContainer();
                      self.$frame = self.frame(maxWidth ? Math.min(sizes.width, maxWidth) : sizes.width);
                      this.$btnClose = self.closeButton();
                      self.$frame.append(this.$btnClose);
                      self.$frame.append(self.cloneCleanImage($img));
                      self.$container.append(self.$frame);
                      let $body = jQuery("body");
                      $body.append(self.$container);
                      setTimeout(() => { if (self.$frame)
                          self.$frame.css("opacity", 1); }, 50);
                  });
              }
          }
          mainContainer() {
              return jQuery(`<div class="sf-imgzoom-container"></div>`);
          }
          frame(width) {
              let $frame = jQuery(`<div class="sf-image-frame"></div>`);
              $frame.css("max-width", `${width}px`);
              $frame.css("opacity", 0);
              return $frame;
          }
          closeButton() {
              let $close = jQuery(`<div class="sf-close-zoom" data-click="zoom-close"><span class="sf-close-zoom-btn sf-icon-cancel "></span></div>`);
              $close.get(0).addEventListener("click", (e) => this.close(e), false);
              return $close;
          }
          cloneCleanImage($img) {
              let $imgResize = $img.clone();
              $imgResize.removeAttr("height").removeAttr("width").removeAttr("sizes").removeClass();
              $imgResize.addClass("sf-zoom-image");
              return $imgResize;
          }
          promiseImageSizes($img) {
              let self = this;
              try {
                  return new Promise((resolve, reject) => {
                      let image = new Image();
                      image.src = $img.attr("src");
                      image.onload = () => resolve({ width: image.width, height: image.height });
                      image.onerror = () => reject("image");
                  });
              }
              catch (e) {
                  throw Error("Promise");
              }
          }
          close(e) {
              if (this.$frame)
                  this.$frame.css("opacity", 0);
              setTimeout(() => this.destroy(), 1000);
          }
          destroy() {
              if (this.$frame)
                  this.$frame.remove();
              if (this.$container) {
                  this.$btnClose.get(0).removeEventListener("click", (e) => this.close(e), false);
                  this.$container.remove();
              }
              this.$container = null;
              this.$frame = null;
          }
      }
      CImgZoom._instance = new CImgZoom();
      function triggerEvents($img, $trigger, maxWidth) {
          let $triggerElement = $trigger || $img;
          if ($triggerElement.length > 0)
              $triggerElement.get(0).addEventListener("click", (e) => CImgZoom.getInstance().zoom($img, maxWidth), false);
      }
      function toFrameImage($img, noicon, maxWidth) {
          let $btn = null;
          if (!noicon) {
              let $frame = jQuery(`<div class="sf-frame-image"></i></div>`);
              $btn = jQuery(`<span class="sf-zoom-open"><i class="sf-icon-resize-full-2"></i></span>`);
              $frame.append($btn);
              $frame.insertBefore($img);
              $img.appendTo($frame);
          }
          triggerEvents($img, $btn, maxWidth);
      }
      function imageZoomFactory(maxWidth) {
          jQuery(".sf-imgZoom").each((index, el) => {
              let $img = jQuery(el);
              let noicon = $img.hasClass("sf-noicon");
              toFrameImage($img, noicon, maxWidth);
          });
      }
      exports.imageZoomFactory = imageZoomFactory;
  });
  define("listes/controller", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class CList {
          constructor(typeList) {
              this.$list = jQuery(`.sf-hierarchy.${typeList}`);
              this.$li = jQuery('li', this.$list);
              this.setLiContainer();
          }
          setLiContainer() {
          }
      }
      class CListFolder extends CList {
          constructor(typeList) {
              super(typeList);
          }
          setLiContainer() {
              this.$li.has("ul").addClass("sf-icon-folder-open sf-container");
              jQuery("li:not(:has(ul))", this.$list).addClass("sf-icon-doc sf-contents");
          }
      }
      function listFolder() {
          let list = new CListFolder("sf-type-folder");
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
      class CResponsiveTopNav {
          constructor($menu, size) {
              this.$menu = $menu;
              this.$menu.addClass(size ? `sf-${size}` : "");
              this.addIcon();
          }
          addIcon() {
              this.$menu.append(this.getModel(this.$menu.is(`ul`)));
              this.triggerEvents();
          }
          getModel(isList) {
              let icon = `<a  href="javascript:void(0)" class="sf-icon-menu" data-click="menuIcon"></a>`;
              let smodel = isList ? `<li class="sf-icon-menu-container">${icon}</li>` : `${icon}`;
              return smodel;
          }
          triggerEvents() {
              this.$menu.get(0).addEventListener("click", (e) => this.click(e), false);
          }
          click(e) {
              let el = e.target;
              el = helper_10.CDom.clickHandler(el);
              if (el)
                  this.doClick(el);
          }
          doClick(el) {
              if (helper_10.CDom.dataClick(el) === "menuIcon")
                  this.clickResponsive();
          }
          clickResponsive() {
              this.$menu.toggleClass(`sf-responsive`);
          }
      }
      function responsiveTopNavFactory(size) {
          jQuery(`.sf-responsive-topnav`).each((index, el) => {
              new CResponsiveTopNav(jQuery(el), size);
          });
      }
      exports.responsiveTopNavFactory = responsiveTopNavFactory;
      function responsiveTopNav(key, size) {
          let $topNav = jQuery(key).addClass("sf-responsive-topnav");
          new CResponsiveTopNav($topNav, size);
      }
      exports.responsiveTopNav = responsiveTopNav;
  });
  define("imageDetail/view", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class CImageDetailView {
          constructor() {
          }
          draw(image, maxwidth, maxheight, frameWidth) {
              this.$detail = jQuery(`<div class="sf-img-detail-result" style="background-image:url('${image.src}')"></div>`);
              this.$image = jQuery(`<div class="sf-img-detail-image" data-mouse-move="move-image"></div>`);
              this.$square = jQuery(`<div class="sf-img-detail-square" data-mouse-move="move-square"></div>`);
              this.$image.append(this.$square);
              this.$image.append(`<img style="max-height:${maxheight}px" src="${image.src}">`);
              this.$btnclose = jQuery(`<div class="sf-close-img-detail" data-click="img-detail-close"><span class="sf-close-img-detail-btn sf-icon-cancel "></span></div>`);
              let $frame = jQuery(`<div class="sf-img-detail-frame" style="max-width:${maxwidth}px"></div>`);
              this.$container = jQuery(`<div class="sf-img-detail-container"></div>`);
              $frame.append(this.$btnclose);
              $frame.append(this.$image);
              $frame.append(this.$detail);
              this.$container.append($frame);
              let $body = jQuery("body");
              $body.append(this.$container);
              let width = Math.min($frame.width(), frameWidth);
              $frame.width(`${width}%`);
          }
          squareOffset() {
              let offset = { width: 0, height: 0 };
              offset.width = this.$square.get(0).offsetWidth;
              offset.height = this.$square.get(0).offsetHeight;
              return offset;
          }
          squareSizes(sizes) {
              let sSizes = sizes || { width: 0, height: 0 };
              if (sizes) {
                  this.$square.width(sizes.width);
                  this.$square.height(sizes.height);
              }
              else {
                  sSizes.width = this.$square.width();
                  sSizes.height = this.$square.height();
              }
              return sSizes;
          }
          squarePosition(position) {
              let pos = position || { left: 0, top: 0 };
              if (position) {
                  this.$square.get(0).style.left = position.left + "px";
                  this.$square.get(0).style.top = position.top + "px";
              }
              else {
                  pos = this.$square.position();
              }
              return pos;
          }
          imageSizes(sizes) {
              let iSizes = sizes || { width: 0, height: 0 };
              if (sizes) {
                  this.$image.width(iSizes.width);
                  this.$image.height(iSizes.height);
              }
              else {
                  iSizes.width = this.$image.width();
                  iSizes.height = this.$image.height();
              }
              return iSizes;
          }
          imagePosition() {
              return this.$image.get(0).getBoundingClientRect();
          }
          resultOffset() {
              let offset = { width: 0, height: 0 };
              offset.width = this.$detail.get(0).offsetWidth;
              offset.height = this.$detail.get(0).offsetHeight;
              return offset;
          }
          resultBackGroundPosition(left, top) {
              this.$detail.get(0).style.backgroundPosition = `-${left}px -${top}px`;
          }
          resultBackGroundSize(width, height) {
              this.$detail.get(0).style.backgroundSize = `${width}px ${height}px`;
          }
          destroy() {
              if (this.$container) {
                  this.$container.empty();
                  this.$container.remove();
              }
          }
      }
      exports.CImageDetailView = CImageDetailView;
  });
  define("imageDetail/controller", ["require", "exports", "helpers/helper", "imageDetail/view", "helpers/helper"], function (require, exports, helper_11, view_3, helper_12) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class CImageDetail {
          constructor() {
              this.ratio = { cx: 0, cy: 0 };
              this.imageUrl = "";
              if (CImageDetail._instance)
                  throw new Error("Error: Instantiation failed: Use CImageDetail.getInstance() instead of new.");
              CImageDetail._instance = this;
              this.orientation = helper_12.orientation.onOrientationChange((orientation) => this.orientationChange(orientation));
          }
          test(orientation) {
              console.log(`test ${orientation}`);
          }
          orientationChange(orientation) {
              console.log(`Orientationchange CImageDetail${this.imageUrl}`);
              if (this.imageUrl != "") {
                  console.log("zoom auto");
                  this.zoom(this.imageUrl, this.width);
              }
          }
          static getInstance() {
              return CImageDetail._instance;
          }
          zoom(imgUrl, maxwidth) {
              this.destroy();
              this.view = new view_3.CImageDetailView();
              this.imageUrl = imgUrl;
              this.width = maxwidth;
              let self = this;
              this.promiseImage(imgUrl).then((image) => {
                  self.view.draw(image, self.width, self.maxHeight(), self.frameWidth(image, self.width));
                  self.zoomLimit(self.view.imageSizes());
                  self.setRation();
                  self.triggerEvents();
              });
          }
          /*Largeur du frame en %*/
          frameWidth(image, maxWidth) {
              if (image.height <= this.maxHeight())
                  return 97;
              let ratioH = this.maxHeight() / image.height;
              let finalImageWidth = image.width * ratioH;
              let ratio = finalImageWidth * 2 * 100 / (window.innerWidth);
              return Math.min(ratio, 97);
          }
          maxHeight() {
              return window.innerHeight - (window.innerHeight * 20 / 100);
          }
          promiseImage(imageUrl) {
              let self = this;
              try {
                  return new Promise((resolve, reject) => {
                      let image = new Image();
                      image.src = imageUrl;
                      image.onload = () => resolve(image);
                      image.onerror = () => reject("image");
                  });
              }
              catch (e) {
                  throw Error("Promise");
              }
          }
          zoomLimit(imageSizes) {
              let greaterSize = Math.max(parseInt(imageSizes.width, 10), parseInt(imageSizes.height, 10));
              let sizeSquare = greaterSize / 10;
              this.view.squareSizes({ width: sizeSquare, height: sizeSquare });
          }
          setRation() {
              let squareOffset = this.view.squareOffset();
              let resultOffset = this.view.resultOffset();
              let imageSizes = this.view.imageSizes();
              this.ratio.cx = resultOffset.width / squareOffset.width;
              this.ratio.cy = resultOffset.height / squareOffset.height;
              this.view.resultBackGroundSize(parseInt(imageSizes.width, 10) * this.ratio.cx, parseInt(imageSizes.height, 10) * this.ratio.cy);
          }
          triggerEvents() {
              this.view.$container.get(0).addEventListener("click", (e) => this.handleClick(e), false);
              this.view.$container.get(0).addEventListener("mousemove", (e) => this.handleMouseMove(e), false);
              this.view.$container.get(0).addEventListener("touchmove", (e) => this.handleMouseMove(e), false);
          }
          handleMouseMove(e) {
              let el = e.target;
              el = helper_11.CDom.mouseMoveHandler(el);
              if (el) {
                  switch (helper_11.CDom.dataMouseMove(el)) {
                      case "move-square":
                      case "move-image":
                          this.moveSquare(e);
                          break;
                  }
              }
          }
          handleClick(e) {
              let el = e.target;
              el = helper_11.CDom.clickHandler(el);
              if (el) {
                  switch (helper_11.CDom.dataClick(el)) {
                      case "img-detail-close":
                          this.close();
                          break;
                  }
              }
          }
          close() {
              this.destroy();
          }
          destroy() {
              this.imageUrl = "";
              this.width = undefined;
              //clean events
              if (this.view) {
                  this.view.$container.get(0).removeEventListener("click", (e) => this.handleClick(e), false);
                  this.view.$container.get(0).removeEventListener("mousemove", (e) => this.handleMouseMove(e), false);
                  this.view.$container.get(0).removeEventListener("touchmove", (e) => this.handleMouseMove(e), false);
                  this.view.destroy();
                  this.view = null;
              }
          }
          moveSquare(e) {
              let pos, squareOffset, imgSizes, x, y;
              /*prevent any other actions that may occur when moving over the image*/
              e.preventDefault();
              /*get sizes position end offset */
              pos = this.getCursorPos(e);
              squareOffset = this.view.squareOffset();
              imgSizes = this.view.imageSizes();
              let imageWidth = parseInt(imgSizes.width, 10);
              let imageHeight = parseInt(imgSizes.height, 10);
              /*calculate the position of the square:*/
              x = pos.x - (squareOffset.width / 2);
              y = pos.y - (squareOffset.height / 2);
              /*prevent the square from being positioned outside the image:*/
              if (x > imageWidth - squareOffset.width) {
                  x = imageWidth - squareOffset.width;
              }
              if (x < 0) {
                  x = 0;
              }
              if (y > imageHeight - squareOffset.height) {
                  y = imageHeight - squareOffset.height;
              }
              if (y < 0) {
                  y = 0;
              }
              /*set the position of the square:*/
              this.view.squarePosition({ left: x, top: y });
              /*move result background*/
              this.view.resultBackGroundPosition((x * this.ratio.cx), (y * this.ratio.cy));
          }
          getCursorPos(e) {
              let cursorPos = { x: 0, y: 0 };
              let a, x, y;
              let event = e || window.event;
              /*get the x and y positions of the image:*/
              a = this.view.imagePosition();
              /*calculate the cursor's x and y coordinates, relative to the image:*/
              x = event.pageX - a.left;
              y = event.pageY - a.top;
              /*consider any page scrolling:*/
              cursorPos.x = x - window.pageXOffset;
              cursorPos.y = y - window.pageYOffset;
              return cursorPos;
          }
      }
      CImageDetail._instance = new CImageDetail();
      /*Mise en place du bouton d'ouverture du composant sur l'image à zoomer*/
      function triggerEvents($img, $trigger, maxWidth) {
          let $triggerElement = $trigger || $img;
          let src = $img.data("detail") || $img.attr("src");
          let img = new Image();
          img.src = src;
          if ($triggerElement.length > 0)
              $triggerElement.get(0).addEventListener("click", (e) => CImageDetail.getInstance().zoom(src, maxWidth), false);
      }
      function toFrameImage($img, noicon, maxWidth) {
          let $btn = null;
          if (!noicon) {
              let $frame = jQuery(`<div class="sf-frame-imgDetail"></i></div>`);
              $btn = jQuery(`<span class="sf-imgDetail-open"><i class="sf-icon-resize-full-2"></i></span>`);
              $frame.append($btn);
              $frame.insertBefore($img);
              $img.appendTo($frame);
          }
          triggerEvents($img, $btn, maxWidth);
      }
      /* */
      function imageDetailFactory(maxWidth) {
          jQuery(".sf-imgDetail").each((index, el) => {
              let $img = jQuery(el);
              let noicon = $img.hasClass("sf-noicon");
              toFrameImage($img, noicon, maxWidth);
          });
      }
      exports.imageDetailFactory = imageDetailFactory;
  });
  define("w-siteFactory", ["require", "exports", "calendar/controller", "slideShow/controller", "helpers/message", "tabsection/controller", "imageZoom/controller", "listes/controller", "responsiveTopnav/controller", "imageDetail/controller"], function (require, exports, Calendar, SlideShow, message, Tabsection, ImgZoom, List, ResponsiveTopNav, ImageDetail) {
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
          let par = params || { "postion": "center,center" };
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
      function imageDetailFactory(maxWidth) {
          ImageDetail.imageDetailFactory(maxWidth);
      }
      exports.imageDetailFactory = imageDetailFactory;
  });
  
  return collect(); 
})();