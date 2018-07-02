import { CDom } from "./helper";

export interface IMessage {
    header: string;
    message: Array<string>;
}
function instanceOfImessage(object: any): boolean {
    let isHeader = (object !== undefined && object !== null && object.header !== undefined && object.header !== null && typeof object.header === "string");
    let isMessage = (object.message !== undefined && object.message !== null && object.message instanceof Array);
    return isHeader && isMessage;
}
export class CMessage {
    $frame: JQuery<HTMLElement>;
    constructor() {
        this.$frame = jQuery(`<div class="sf-message-box"></div>`)
    }
    private messsageBoxList(): JQuery<HTMLElement> {
        let $list: JQuery<HTMLElement> = jQuery(".sf-message-box");
        return $list;
    }
    public error(messages: IMessage | any, error?: Error): void {
        this.$frame.addClass("sf-error");
        this.show(this.message(messages, error));
    }
    public info(content: IMessage | any, code?: string) {
        this.$frame.addClass("sf-info");
        this.show(this.message(content, code ? new Error(code) : undefined));
    }
    private message(messages: IMessage | any, error?: Error): IMessage {
        let messContent: Array<string>;
        let mess: IMessage;
        if (instanceOfImessage(messages)) {
            mess = messages
        } else {
            error = error || new Error("unknonwn");
            messContent = messages[error.message] || new Array(error.message);
            mess = {
                header: messages.Header,
                message: messContent
            }
        }
        return mess;
    }
    private show(content: IMessage) {
        let count: number = this.messsageBoxList().length;
        this.$frame.css("z-index", 1000 + count);
        let $header: JQuery<HTMLElement> = this.header(content.header);
        let $frameContent: JQuery<HTMLElement> = jQuery(`<div class="sf-message-content"></div>`);
        let strContent: string = "";
        content.message.forEach((line) => {
            strContent += `<div class="sf-message-line">${line}</div>`;
        })
        $frameContent.append(jQuery(strContent));
        this.$frame.append(this.header(content.header));
        this.$frame.append($frameContent);
        let $body = jQuery("body");
        $body.append(this.$frame);
        let frameWidth: number = this.$frame.width() || 0;
        let width: number = ($body.width() || (frameWidth));
        let left: number = (width - frameWidth) / 2;
        this.$frame.css('left', (left + count * 20) + 'px');
        this.$frame.css('top', (20 + count * 40) + 'px');
        this.triggerEvent();
    }
    private triggerEvent() {
        let el: HTMLElement | null = this.$frame.get(0);
        if (el) {
            el.addEventListener("click", (e: Event) => this.click(e), false);
        }
    }
    private click(e: Event) {
        let el: HTMLElement = e.target as HTMLElement;
        el = CDom.clickHandler(el);
        if (el) {
            switch (CDom.dataClick(el)) {
                case "message-close":
                    this.destroy();
                    break;
            }
        }
    }
    private header(title: string): JQuery<HTMLElement> {
        let stringHeader: string = `<div class="sf-message-header"><div class="sf-message-title">${title}</div>`;
        stringHeader += `<div class="sf-close-popup" data-click="message-close"><i class="sf-icon-cancel"></i></div>`
        stringHeader += `</div>`;
        return jQuery(stringHeader);
    }
    private destroy() {
        let el: HTMLElement | null = document.getElementById("sf-message");
        if (el) {
            el.removeEventListener("click", (e: Event) => this.click(e), false);
        }
        this.$frame.remove();
    }
}
export function showError(messages: IMessage | any, error?: Error): void {
    let mess = new CMessage().error(messages, error)
}
export function showInfo(content: IMessage) {
    let mess = new CMessage().info(content)
}