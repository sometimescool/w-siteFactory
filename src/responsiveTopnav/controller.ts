import { CDom } from "../helpers/helper";
/**
 * params{
 * }
 */
class CResponsiveTopNav {
    $menu: JQuery<HTMLElement>;
    constructor($menu: JQuery<HTMLElement>,size:number|undefined) {
        this.$menu = $menu;
        this.$menu.addClass(size?`sf-${size}`:"");
        this.addIcon();
    }
    private addIcon(): void {
        this.$menu.append(this.getModel(this.$menu.is(`ul`))) ;
        this.triggerEvents();
    }
    private getModel(isList:boolean): string {
        let icon:string=`<a  href="javascript:void(0)" class="sf-icon-menu" data-click="menuIcon"></a>`;
        let smodel:string=isList?`<li class="sf-icon-menu-container">${icon}</li>`:`${icon}`;
        return smodel;
    }
    private triggerEvents(): void {
        this.$menu.get(0).addEventListener("click", (e: Event) => this.click(e), false);
    }
    private click(e: Event): void {
        let el: HTMLElement = e.target as HTMLElement;
        el = CDom.clickHandler(el);
        if (el) this.doClick(el)
    }
    private doClick(el: HTMLElement): void {
        if (CDom.dataClick(el) === "menuIcon")
            this.clickResponsive();
    }
    private clickResponsive(): void {
        this.$menu.toggleClass(`sf-responsive`);
    } 
}
export function responsiveTopNavFactory(size:number | undefined): void {
    jQuery(`.sf-responsive-topnav`).each((index, el) => {
        new CResponsiveTopNav(jQuery(el),size);
    })
}
export function responsiveTopNav(key:string,size:number | undefined): void {
    let $topNav=jQuery(key).addClass("sf-responsive-topnav");
    new CResponsiveTopNav($topNav,size);
}