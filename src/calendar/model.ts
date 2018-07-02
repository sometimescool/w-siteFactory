type PromiseResolve<T> = (value?: T | PromiseLike<T>) => void;
type PromiseReject = (error?: any) => void;
declare var Promise: any;

import { CString } from "../helpers/helper";
import { CDate } from "../helpers/helper";

export interface IStart {
	year: number;
	month: number; // 0:janvier
}

interface IModel {
	lastKey: string;
	getPeriods: any;
	getAvailabilities: any;
	getLegend: any;
	data(start: IStart, monthCount: number): any;
	dataReduce(start: IStart, monthCount: number): any;
}
export class CrModel implements IModel {
	private dataid: string;
	private _periods: any;
	private _availabilities: any;
	private _data: any;
	private _lastKey: string;
	private _dataRoot: string;
	constructor(dataid: string, dataRoot: string) {
		this.dataid = dataid;
		this._dataRoot = dataRoot
		this._periods = null;
		this._availabilities = null;
		this._data = null;
		this._lastKey = "";
	}
	get lastKey(): string {
		return this._lastKey;
	}
	getPeriods(location: string): any {
		let self = this;
		try {
			return new Promise((resolve: PromiseResolve<any>, reject: PromiseReject): void => {
				if (self._periods) {
					resolve()
				}
				else {
					jQuery.getJSON(location, data => {
						self._periods = data[self.dataid] || data
						resolve()
					}).fail(() => reject("Periods"))
				}
			});
		} catch (e) { throw Error("Promise") }
	}
	getAvailabilities(location: string): any {
		let self = this;
		try {
			return new Promise((resolve: PromiseResolve<any>, reject: PromiseReject): void => {
				if (self._availabilities) {
					resolve()
				}
				else {
					jQuery.getJSON(location, data => {
						self._availabilities = data[self.dataid] || data;
						resolve();
					}).fail(() => reject("Availabilities"))
				}
			});
		} catch (e) { throw Error("Promise") }
	}
	getLegend(location: string): any {
		let self = this;
		try {
			return new Promise((resolve: PromiseResolve<any>, reject: PromiseReject): void => {
				jQuery.getJSON(location, data => {
					resolve(data[self.dataid] || data)
				}).fail(() => reject("Legend"))
			});
		} catch (e) { throw Error("Promise") }
	}
	data(start: IStart, monthCount: number): any {
		if (!this._data) {
			//merge and reorganized datas
			this._data = {};
			this.buildPeriods();
			this.buildAvailabilities();
		};
		return this.dataReduce(start, monthCount);
	}
	/* reduce data from start month to month count to display.
	called each time start month change*/
	dataReduce(start: IStart, monthCount: number): any {
		let data: any = {};
		let dateStart: Date = new Date(start.year, start.month, 1, 5);
		let dateEnd: Date = new Date(start.year, start.month + monthCount, 0, 5);
		let startKey: string = CDate.getKey(dateStart);
		let endKey: string = CDate.getKey(dateEnd);
		let splittedKey: any;
		for (let monthDay in this._data) {
			if (monthDay >= startKey && monthDay <= endKey) {
				splittedKey = CString.split1Date(monthDay);
				data[splittedKey.month] = data[splittedKey.month] || [];
				data[splittedKey.month].push({ "day": splittedKey.day, "data": this._data[monthDay] });
			}
		}
		return data
	}
	get datas():any{
		return this._data;
	}
	//build periods for all datas
	private buildPeriods() {
		let self = this;
		let lastKey: string = ""
		for (let year in self._periods) {
			self._periods[year].forEach((elt: any) => {
				let date: Date = new Date(parseInt(year, 10), parseInt(elt.start.split("-")[0], 10) - 1, parseInt(elt.start.split("-")[1], 10));
				let dateStart: Date = new Date(parseInt(year, 10), parseInt(elt.start.split("-")[0], 10) - 1, parseInt(elt.start.split("-")[1], 10));
				let dateEnd: Date = new Date(parseInt(year, 10), parseInt(elt.end.split("-")[0], 10) - 1, parseInt(elt.end.split("-")[1], 10));
				let keyToDay = CDate.getKey(new Date());
				while (date.getTime() <= dateEnd.getTime()) {
					let key: string = CDate.getKey(date);
					if (key > lastKey) lastKey = key;
					self._data[key] = self._data[key] || {};
					let startPeriod: boolean = (date.getTime() == dateStart.getTime());
					let endPeriod: boolean = (date.getTime() == dateEnd.getTime());
					if (key > keyToDay) {
						self._data[key].typeMorning = ((self._data[key].typeMorning) ? self._data[key].typeMorning: "") + (!startPeriod || (startPeriod && endPeriod) ? (" " + "sf-"+elt.type) : "");
						self._data[key].typeAfternoon = ((self._data[key].typeAfternoon) ? self._data[key].typeAfternoon: "") + (!endPeriod || (startPeriod && endPeriod) ? (" " + "sf-"+elt.type) : "");
					} else {
						self._data[key].overDate = true;
						self._data[key].rent = true;
					}
					date = new Date(date.getFullYear(), date.getMonth(), (date.getDate() + 1));
				}
			})
		}

		self._lastKey = lastKey;
	}
	//build availabilities for all datas
	private buildAvailabilities() {
		let self = this;
		for (let year in self._availabilities) {
			self._availabilities[year].forEach((elt: any) => {
				let date: Date = new Date(parseInt(year, 10), parseInt(elt.start.split("-")[0], 10) - 1, parseInt(elt.start.split("-")[1], 10));
				let dateEnd: Date = new Date(parseInt(year, 10), parseInt(elt.end.split("-")[0], 10) - 1, parseInt(elt.end.split("-")[1], 10));
				let dateStart: Date = date;
				while (date.getTime() <= dateEnd.getTime()) {
					let key: string = CDate.getKey(date);
					self._data[key] = self._data[key] || {};
					self._data[key].rent = true;
					if (!self._data[key].overDate) {
						if (dateStart.getTime() == date.getTime()) self._data[key].start = true;
						if (dateEnd.getTime() == date.getTime()) self._data[key].end = true;
					}
					date = new Date(date.getFullYear(), date.getMonth(), (date.getDate() + 1));
				}
			})
		}
	}
}