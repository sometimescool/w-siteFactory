import * as Calendar from "./calendar/controller";
import * as SlideShow from "./slideShow/controller";
import * as message from "./helpers/message";
import { IMessage } from "./helpers/message";
import * as Tabsection from "./tabsection/controller";
import * as ImgZoom from "./imageZoom/controller";
import * as List from "./listes/controller";
import * as ResponsiveTopNav from "./responsiveTopnav/controller";
import * as ImageDetail from "./imageDetail/controller";
import * as helper from "./helpers/helper";

export function calendarFactory(): void {
    Calendar.calendarFactory()
}
export function calendar(id: string): Calendar.CrCalendar | null {
    return Calendar.calendar(id)
}
export function slideShowFactory(): void {
    SlideShow.slideShowFactory()
}
export function slideShow(id: string): void {
    SlideShow.slideShow(id)
}
export function info(content: IMessage): void {
    message.showInfo(content)
}
export function error(messages: IMessage | any, error?: Error): void {
    message.showError(messages, error)
}
export function panelSectionFactory(params: any): void {
    Tabsection.panelSectionFactory(params)
}
export function linkSectionFactory(selector: string, params?: any): void {
    let par: any = params || { "postion": "center,center" }
    par.position = par.position ? par.position : "center,center";
    Tabsection.linkSectionFactory(selector, par)
}
export function imageZoomFactory(maxWidth: number | null): void {
    ImgZoom.imageZoomFactory(maxWidth);
}
export function listFolder(): void {
    List.listFolder();
}
export function responsiveTopNavFactory(size: number | undefined) {
    ResponsiveTopNav.responsiveTopNavFactory(size);
}
export function responsiveTopNav(key: string, size: number | undefined) {
    ResponsiveTopNav.responsiveTopNav(key, size);
}
export function imageDetailFactory(maxWidth: number | null): void {
    ImageDetail.imageDetailFactory(maxWidth);
}
export function onOrientationChange(callBack:Function):string{
    return helper.orientation.onOrientationChange(callBack);
}
export function removeOrientationChange(key:string):void{
    helper.orientation.removeOrientationChange(key);
}
export function UUID():string {
    return helper.UUID();
}
export function clickHandler(element:HTMLElement):void{
    helper.CDom.clickHandler(element)​
}
export function mouseMoveHandler(element:HTMLElement):void{
    helper.CDom.mouseMoveHandler(element)​
}
export function dataClick(element:HTMLElement):string{
    return  helper.CDom.dataClick(element);
}
​export function dataMouseMove(element:HTMLElement):string{
    return  helper.CDom.dataMouseMove(element);
}