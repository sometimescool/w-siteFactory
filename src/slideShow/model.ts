type PromiseResolve<T> = (value?: T | PromiseLike<T>) => void;
type PromiseReject = (error?: any) => void;
declare var Promise: any;

export interface IImage {
	url: string;
	caption: string;
}
/**
 Gestion de données
 */
export class CSModel {
	_imageRoot: string;
	_data: Array<IImage> = [];
	constructor(imageRoot: string) {
		this._imageRoot = imageRoot;
	}
	/**
	 * Aquisition des données json  (sliderShow.json)
	 * @param id @type {string} @returns Promise
	 */
	requestdata(id?: string, dataLocation?: string, data?: any): any {
		let self = this;
		try {
			return new Promise((resolve: PromiseResolve<any>, reject: PromiseReject): void => {
				self.updateData(resolve, reject, id, dataLocation, data);
			});
		} catch (e) { throw Error("Promise") }
	}
	private updateData(resolve: PromiseResolve<any>, reject: PromiseReject, id?: string, dataLocation?: string, data?: any) {
		let self = this;
		let location: string;
		if (dataLocation) {
			jQuery.getJSON(dataLocation + "?" + (new Date().getTime()), data => {
				self._data = id ? self.setImagesUrl(data[id]) : self.setImagesUrl(data);
				resolve(self.data)
			}).fail(() => reject("slideShow"))
		} else if (data) {
			self._data = id ? self.setImagesUrl(data[id]) : self.setImagesUrl(data);
		} else {
			reject("slideShow");
		}
	}
	public get data(): Array<IImage> {
		return this._data;
	}
	public get length(): number {
		return this.data.length;
	}
	private setImagesUrl(data: any): Array<IImage> {
		var self = this;
		return data.map((obj: any) => {
			obj.url = self._imageRoot + obj.name;
			return obj;
		})

	}
}