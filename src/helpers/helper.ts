export interface ISplitedKey {
    year: number;
    month: number; //0:janvier
    day: number;
}
export interface ISplited1Key {
    month: string; //aaaa-mm,janvier: 01
    day: string; //jj
}

class COrientation {
    private orientation: string;
    private on: boolean = false;
    private timer: number | null;
    private static time: number = 100;
    private static landscape: string = "landscape";
    private static portrait: string = "portrait";
    private callBacks: Map<string, Function> = new Map<string, Function>();
    private static _instance: COrientation = new COrientation();
    constructor() {
        if (COrientation._instance) {
            throw new Error("Error: Instantiation failed: Use COrientation.getInstance() instead of new.");
        }
        this.orientation = this.getOrientation();
        COrientation._instance = this;
    }
    public static getInstance(): COrientation {
        return COrientation._instance;
    }
    private triggerEvents(): void {
        window.addEventListener("resize", (e: Event) => this.handleResize(e), false);
    }
    public onOrientationChange(callback: Function): string {
        if (!this.on) {
            this.triggerEvents();
            this.on = true;
        }
        let _uuid: string = UUID();
        this.callBacks.set(_uuid, callback);
        return _uuid;
    }
    public removeOrientationChange(key: string): void {
        if (this.callBacks.has(key)) {
            this.callBacks.delete(key);
        }
    }
    private handleResize(e: Event) {
        clearTimeout(this.timer);
        this.timer = setTimeout((e: Event) => this.reSize(e), COrientation.time);
    }
    private reSize(e: Event): void {
        if (this.getOrientation() != this.orientation) {
            let orientation: string = this.getOrientation();
            this.orientation = orientation;
            this.broadcast(orientation);
        }
    }
    private broadcast(orientation: string): void {
        this.callBacks.forEach((value, key, map) => value(orientation))
    }
    private getOrientation(): string {
        return window.outerWidth > window.outerHeight ? COrientation.landscape : COrientation.portrait;
    }
}
export let orientation: COrientation = COrientation.getInstance();

export class CDom {
    static dataMouseMove(el: HTMLElement): string | null {
        let value: string | null = null;
        value = el.getAttribute("data-mouse-move");
        return value;
    }
    static dataClick(el: HTMLElement): string | null {
        let value: string | null = null;
        value = el.getAttribute("data-click");
        return value;
    }
    static clickHandler(el: HTMLElement): HTMLElement {
        let elmt: HTMLElement | null = el;
        while (elmt != null && !CDom.dataClick(elmt)) {
            elmt = elmt.parentElement;
        }
        return elmt as HTMLElement;
    }
    static mouseMoveHandler(el: HTMLElement): HTMLElement {
        let elmt: HTMLElement | null = el;
        while (elmt != null && !CDom.dataMouseMove(elmt)) {
            elmt = elmt.parentElement;
        }
        return elmt as HTMLElement;
    }
}
export class CString {
    static repeat(stringToRepeat: string, count: number) {
        let AString: Array<string> = [];
        let nRep = 0;
        while (nRep < count) {
            AString.push(stringToRepeat)
        }
        return AString.join("");
    }
    static padStart(stringToPad: string, targetLength: number, padString?: string): string {
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
    static split1Date(stringDate: string): ISplited1Key {
        let keys: Array<string> = stringDate.split("-");
        let splittedKey: ISplited1Key = { "month": "", "day": "" };
        if (keys.length == 3) {
            splittedKey.month = keys[0] + "-" + keys[1];
            splittedKey.day = keys[2]
        } else {
            throw new Error("Error String.split1Date format (nnnn-nn-nn): value " + stringDate)
        }
        return splittedKey;
    }
    static splitDate(stringDate: string): ISplitedKey {
        let keys: Array<string> = stringDate.split("-");
        let splittedKey: ISplitedKey = { "year": 0, "month": 0, "day": 0 };
        if (keys.length == 3) {
            splittedKey.year = parseInt(keys[0], 10);
            splittedKey.month = parseInt(keys[1], 10) - 1;
            splittedKey.day = parseInt(keys[2], 10);
        } else {
            throw new Error("Error String.splitDate format (nnnn-nn-nn): value " + stringDate)
        }
        return splittedKey;
    }
}
export class CDate {
    /**
     * @param date type Date
     * @return  AAAA-MM-JJ
     */
    static getKey(date: Date): string {
        let sMonth: string = CString.padStart((date.getMonth() + 1) + "", 2, "0");
        let sDay: string = CString.padStart((date.getDate() + ""), 2, "0");
        return date.getFullYear() + "-" + sMonth + "-" + sDay;
    }
    /**
     * @param date type Date
     * @return day with monday as start week
     */
    static getFrenchDay(date: Date): number {
        let day: number = date.getDay();
        let frenchDay: number = (day == 0) ? 7 : day;
        frenchDay--;
        return frenchDay;
    }
    /**
     * @param date type Date
     * @return the day of the first date of the month
     */
    static getFrenchFirstDay(date: Date): number {
        let firstDate: Date = new Date(date.getFullYear(), date.getMonth(), 1, 4);
        return CDate.getFrenchDay(firstDate);
    }
    /**
     * @param date type Date
     * @return  the week position in the month
     */
    static getFrenchWeekInMonth(date: Date): number {
        let numWeek: number = 0;
        return Math.floor((date.getDate() + CDate.getFrenchFirstDay(date) - 1) / 7);
    }
}

export let UUID=function (): string {
    return 'sf_xxxxxxxx-xxxxxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g,
        c => {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}