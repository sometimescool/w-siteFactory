import { CDate } from "../helpers/helper";

interface ICrView {
	draw(data: any, legend: any): void;
	monthContentDraw(data: any): void;
}
//Calendar view
export class CrView implements ICrView {
	private _container: JQuery<HTMLElement>;
	private monthsContainer: JQuery<HTMLElement>;
	constructor(container: JQuery<HTMLElement>) {
		this._container = container;
		this.monthsContainer = jQuery("<div class='sf-months-container'></div>");
	}
	private get header(): JQuery<HTMLElement> {
		let html: Array<string> = [];
		html.push('<div class="sf-calendar-buttons">');
		html.push('<div class="sf-button-previous" data-click="previous-group"><i class="sf-icon-angle-double-left"></i></div>');
		html.push('<div class="sf-button-previous-month"  data-click="previous-month"><i class="sf-icon-angle-left"></i></div>');
		html.push('<div class="sf-button-next-month"  data-click="next-month"><i class="sf-icon-angle-right"></i></div>');
		html.push('<div class="sf-button-next"  data-click="next-group"><i class="sf-icon-angle-double-right"></i></div>');
		html.push('</div>');
		return jQuery(html.join(""))
	}
	private footer(legend: any): JQuery<HTMLElement> {
		let footer: JQuery<HTMLElement> = jQuery("<div class='sf-calendar-footer'></div>");
		footer.append("<div class='sf-calendar-legend'><div class='sf-rented sf-icon-legend'></div>Non disponible</div>");
		footer.append("<div class='sf-calendar-legend'><div class='sf-notinit sf-icon-legend'></div>Fermé</div>");
		for (let key in legend) {
			let sfCssClass:string = `sf-${key}`;
			footer.append(`<div class="sf-calendar-legend"><div class="${sfCssClass} sf-icon-legend"></div>${legend[key]}</div>`);
		}
		return footer;
	}
	get container(): JQuery<HTMLElement> {
		return this._container;
	}
	draw(data: any, legend: any) {
		this.container.append(this.header);
		this.container.append(this.monthsContainer);
		this.container.append(this.footer(legend));
		this.monthContentDraw(data);
	}
	monthContentDraw(data: any) {
		this.monthsContainer.empty();
		for (let yearMonth in data) {
			let year: number = parseInt(yearMonth.split("-")[0], 10);
			let month: number = parseInt(yearMonth.split("-")[1], 10);
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
	private buildMonth(year: number, month: number, data: Array<any>): JQuery<HTMLElement> {
		let label: string = this.monthLabel(year, month)
		let content: JQuery<HTMLElement> = jQuery('<div class="sf-layout-month">');
		content.append('<div class="sf-header-month">' + label + '</div>');
		let monthContent = jQuery('<table class="sf-month-content" cellspacing="0"></div>');
		monthContent.append("<tr><th>Lun</th><th>Mar</th><th>Mer</th><th>Jeu</th><th>Ven</th><th>Sam</th><th>Dim</th></tr>");
		content.append(monthContent);
		let noWeek: number = -1;
		let dayArray: Array<string> = [];
		let monthArray: Array<any> = [];
		let noDay: string;
		for (let length = data.length, i = 0; i < length; i++) {
			let date: Date = new Date(year, month - 1, parseInt(data[i].day, 10), 4);
			if (noWeek != CDate.getFrenchWeekInMonth(date)) {
				noDay = "";
				dayArray = this.initWeek();
				monthArray.push(dayArray);
				noWeek = CDate.getFrenchWeekInMonth(date);
			}
			noDay = parseInt(data[i].day, 10) + "";
			dayArray[CDate.getFrenchDay(date) + 1] = this.htmlDay(noDay, data[i].data);
		}
		while (monthArray.length < 6) {
			monthArray.push(this.initWeek());
		}
		monthContent.append(jQuery(monthArray.join("")));
		return content;
	}
	private initWeek(): Array<string> {
		return ['<tr>', this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), this.htmlDay("", {}), '</tr>'];
	}
	private htmlDay(noDay: string, params: any): string {
		let html: string = '';
		let cssCel:string='';
		let rentedMorning: boolean = (params.rent && !params.start) || (params.rent && params.start && params.end);
		let rentedAfternoon: boolean = (params.rent && !params.end) || (params.rent && params.start && params.end);
		let cssMorning: string = "sf-calendar-day-morning " + (rentedMorning ? 'sf-rented' : params.typeMorning);
		let cssAfternoon: string = "sf-calendar-day-afternoon " + (rentedAfternoon ? 'sf-rented' : params.typeAfternoon);
		cssCel=((rentedMorning && rentedAfternoon) ||(params.typeMorning==" sf-notinit" && params.typeAfternoon==" sf-notinit"))?" sf-notfree":"";
		html = `<td class="sf-calendar-day${cssCel}">`;
		html += noDay;
		html += '<div class="' + cssMorning + '"></div>';
		html += '<div class="' + cssAfternoon + '"></div>';
		html += "</td>";
		return html;
	}
	private monthLabel(year: number, month: number): string {
		let index: number = month - 1;
		let label: Array<string> = ["Janvier", "F&eacute;vrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Ao&ucirc;t", "Septembre", "Octobre", "Novembre", "D&eacute;cembre"];
		return label[index] + " " + year;
	}
}