import { CSlideView } from "./view";
import { IParams } from "./view";
import { CSModel } from "./model";
import { IImage } from "./model";
import { messagesfr } from "./messages";
import { CMessage } from "../helpers/message";
import { CDom } from "../helpers/helper";

/** 
 * @description 
 * Paramètres du slider. Attribut data-params de la div class "layout-sliderShow" 
 ** id {string} : identifiant des données 
 ** showCaption {boolean} : Afficher le label image
 ** showThumbnail {boolean}  : Afficher le navigateur d'images 
 ** imageRoot {string} : url d'accès aux images.
 * @example  <div id="sliderShow" class="layout-sliderShow" data-params='{"id":"sliderShow1","showCaption":true,"showThumbnail":false,"imageRoot":"./img/"}'></div>
*/
export interface ISlideShowParams {
  dataid?: string;
  dataLocation?: string;
  data?: any;
  showCaption: boolean;
  showThumbnail: boolean;
  imageRoot: string;
}

export class CSlideShow {
  private _view: CSlideView;
  private _model: CSModel;
  private _params: ISlideShowParams;
  private _id: string;
  private _currentIndex: number = 0;
  constructor($container: JQuery<HTMLElement>, params: ISlideShowParams) {
    this._id = $container.attr("id") || "";
    this._params = params;
    this._view = new CSlideView($container);
    this._model = new CSModel(this._params.imageRoot);
    $container.removeAttr("data-params")
  }
  private triggerEvents() {
    let el: HTMLElement | null = this._view.container.get(0);
    if (el) {
      el.addEventListener("click", (e: Event) => this.click(e), false);
    }
  }
  private click(e: Event) {
    let el: HTMLElement = e.target as HTMLElement;
    el = CDom.clickHandler(el);
    if (el) {
      switch (CDom.dataClick(el)) {
        case "slide-left":
          this.clickSlideBtns(-1);
          break;
        case "slide-right":
          this.clickSlideBtns(1)
          break;
        case "thumbnails-right":
          this.clickThumbernailBtns(true);
          break;
        case "thumbnails-left":
          this.clickThumbernailBtns(false);
          break;
        case "thumbnail":
          this.clickThumbnail(parseInt(el.getAttribute("data-index") || "0", 10))
          break;
      }
    }
  }
  private clickSlideBtns(progress: number) {
    let self = this;
    let index: number = self._currentIndex;
    index += progress;
    self.changeSlide(index);
    let newLeft: number = self._view.showThumbNail(index);
    self.btnsState(newLeft);
  }
  private clickThumbnail(index: number) {
    let self = this;
    self.changeSlide(index);
    self.btnsState(self._view.rowLeft);
  }
  private clickThumbernailBtns(right: boolean) {
    let self = this;
    let newLeft: number = 0;
    newLeft = self._view.moveThumbNails(right);
    self.btnsState(newLeft);
  }
  private btnsState(rowLeft: number): void {
    let left: string = (rowLeft >= 0) ? "hidden" : "visible";
    let right: string = (-rowLeft + this._view.containerWidth >= this._view.rowWidth) ? "hidden" : "visible";
    this._view.thumbnailBtnsVisibility(left, right);
    left = (this._currentIndex == 0) ? "hidden" : "visible";
    right = (this._currentIndex == this._model.length - 1) ? "hidden" : "visible";
    this._view.slideBtnsVisibility(left, right);
  }
  private changeSlide(index: number) {
    this._currentIndex = Math.max(index, 0) && Math.min(index, this._model.length - 1);
    this._view.refresh(this._model.data[this._currentIndex], this._model.length, this._currentIndex);
  }
  show(): void {
    let self = this;
    try {
      self._model.requestdata(self._params.dataid, self._params.dataLocation)
        .then((result: Array<IImage>) => {
          let viewParams: IParams = { current: 0, showThumbnail: self._params.showThumbnail, showCaption: self._params.showCaption };
          self._view.draw(viewParams, result);
          self.triggerEvents();
          self.btnsState(0);
        })
        .catch(function (e: any) {
          new CMessage().error(messagesfr, Error(e))
        })
    } catch (e) { new CMessage().error(messagesfr, e) }
  }
}
export function slideShowFactory(): void {
  jQuery(".sf-slideShow").each((index, el) => {
    let $container: JQuery<HTMLElement> = jQuery(el);
    let params: ISlideShowParams = $container.data("params");
    let slideShow = new CSlideShow($container, params);
    slideShow.show();
  })
}
export function slideShow(id: string): void {
  let $container: JQuery<HTMLElement> = jQuery(`#${id}`);
  if ($container.length > 0){
    let params: ISlideShowParams = $container.data("params");
    let slideShow = new CSlideShow($container, params);
    slideShow.show();
  }
}