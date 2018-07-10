import { CrView } from "./view";
import { CrModel } from "./model";
import { IStart } from "./model";
import { messagesfr } from "./messages";
import { CMessage } from "../helpers/message";
import { ISplitedKey } from "../helpers/helper";
import { CString } from "../helpers/helper";
import { ISplited1Key } from "../helpers/helper";
import { CDom } from "../helpers/helper";
import { CDate } from "../helpers/helper";

/** 
 * @description 
 * Paramètres du slider. Attribut data-params de la div class "layout-sliderShow" 
 ** id {string} : identifiant des données 
 ** monthCount {number} : Nombre de mois à afficher.
 * @example  <div id="calendar" class="sf-calendar" data-params='{"id":"lecerf","monthCount":3'}></div>
*/
export interface ICalendarParams {
	dataid: string;
	monthCount: number;
	dataRoot: string;
	availabilities: string;
	periods: string;
	legend: string;
}

export interface ICalendar {
	show(): void;
}
// Calendar controller
export class CrCalendar implements ICalendar {
	private monthCount: number;
	private model: CrModel;
	private view: CrView;
	private start: IStart; //start year and month
	private params: ICalendarParams;
	constructor($container: JQuery<HTMLElement>, params: ICalendarParams) {
		this.params = params;
		this.monthCount = params.monthCount;
		this.start = { year: new Date().getFullYear(), month: new Date().getMonth() };
		this.model = new CrModel(params.dataid, params.dataRoot);
		this.view = new CrView($container);
		$container.removeAttr("data-params");
	};
	private previousGroup() {
		let newDate: Date = new Date(this.start.year, this.start.month - this.monthCount, 1, 5);
		this.start = this.computePreviousStart(newDate);
		this.refresh();
	}
	private previousMonth() {
		let newDate: Date = new Date(this.start.year, this.start.month - 1, 1, 5);
		this.start = this.computePreviousStart(newDate);
		this.refresh();
	}
	private computePreviousStart(date: Date): IStart {
		let today: Date = new Date();
		let minDateToDisplay: Date = (date.getTime() < today.getTime()) ? today : date;
		let start: IStart = { year: 0, month: 0 };
		start.year = minDateToDisplay.getFullYear();
		start.month = minDateToDisplay.getMonth();
		return start;
	}
	private nextGroup() {
		let newDate: Date = new Date(this.start.year, this.start.month + this.monthCount, 1, 4);
		this.start = this.computeNextStart(newDate);
		this.refresh();
	}
	private nextMonth() {
		let newDate: Date = new Date(this.start.year, this.start.month + 1, 1, 4);
		this.start = this.computeNextStart(newDate)
		this.refresh();
	}
	private computeNextStart(date: Date): IStart {
		let start: IStart = { year: 0, month: 0 };
		let maxKey: string = this.model.lastKey;
		let maxKeySplited: ISplitedKey = CString.splitDate(maxKey);
		let maxDate = new Date(maxKeySplited.year, maxKeySplited.month + 1 - this.monthCount, 1, 4);
		let maxDateToDisplay: Date = (date.getTime() < maxDate.getTime()) ? date : maxDate;
		start.year = maxDateToDisplay.getFullYear();
		start.month = maxDateToDisplay.getMonth();
		return start;
	}
	private triggerEvents() {
		let el: HTMLElement | null = this.view.container.get(0);
		if (el) {
			el.addEventListener("click", (e: Event) => this.click(e), false);
		}
	}
	private click(e: Event) {
		let el: HTMLElement = e.target as HTMLElement;
		el = CDom.clickHandler(el);
		if (el) {
			switch (CDom.dataClick(el)) {
				case "previous-group":
					this.previousGroup();
					break;
				case "previous-month":
					this.previousMonth();
					break;
				case "next-month":
					this.nextMonth()
					break;
				case "next-group":
					this.nextGroup();
					break;
			}
		}
	}
	private dataLocation(dataid: string): string {
		let location: string = this.params.dataRoot;
		return `${location}${dataid}?${(new Date().getTime())}`
	}
	show() {
		let self = this;
		let _data: any;
		try {
			self.model.getPeriods(this.dataLocation(this.params.periods))
				.then(() => {
					return self.model.getAvailabilities(this.dataLocation(this.params.availabilities))
				})
				.then(() => {
					_data = self.model.data(self.start, self.monthCount);
					return self.model.getLegend(this.dataLocation(this.params.legend))
				})
				.then((result: any) => {
					self.view.draw(_data, result);
					self.triggerEvents();
				})
				.catch(function (e: any) {
					new CMessage().error(messagesfr, Error(e))
				})
		} catch (e) {
			new CMessage().error(messagesfr, e)
		}
	}
	dayArrivalSelectable(date: Date): Array<any> { //called by jsquery calendar popup 
		let configDay: any = this.getDateConfigDay(date);
		/**
		 * configDay
				{typeMorning: "highless", typeAfternoon: "highless", rent: true, start: true}
				{typeMorning: "highless", typeAfternoon: "highless", rent: true, end: true}
				{typeMorning: "highless", typeAfternoon: "highless", rent: true, end: true,start:true}
				{typeMorning: "highless", typeAfternoon: "highless", start: true}
				{typeMorning: "highless", typeAfternoon: "highless", end: true}
				{typeMorning: "highless", typeAfternoon: "highless"}
		 */
		let selectable: boolean = !configDay.overDate && (!configDay.rent || (!configDay.start && configDay.end));
		let css: string = selectable ? configDay.typeAfternoon : "";
		return [selectable, css, ""];
	}
	dayDepartureSelectable(date: Date): Array<any> { //called by jsquery calendar popup
		let configDay: any = this.getDateConfigDay(date);
		let selectable: boolean = !configDay.overDate && (!configDay.rent || (!configDay.end && configDay.start));
		let css: string = selectable ? configDay.typeMorning : "";
		return [selectable, css, ""];
	}
	private getDateConfigDay(date: Date): any {
		let data: any = this.model.datas;
		let stringDate: string = CDate.getKey(date);
		let configDay: any = data[stringDate];
		return configDay;
	}
	private refresh(): void {
		let _data: any = this.model.dataReduce(this.start, this.monthCount);
		this.view.monthContentDraw(_data);
	}
}
export function calendarFactory(): void {
	jQuery(".sf-calendar").each((index, el) => {
		let $container: JQuery<HTMLElement> = jQuery(el);
		let params: ICalendarParams = $container.data("params");
		let cal = new CrCalendar($container, params);
		cal.show();
	})
}
export function calendar(id: string): CrCalendar | null {
	let $container: JQuery<HTMLElement> = jQuery(`#${id}`);
	if ($container.length == 0) return null;
	let params: ICalendarParams = $container.data("params");
	let cal = new CrCalendar($container, params);
	cal.show();
	return cal;
}