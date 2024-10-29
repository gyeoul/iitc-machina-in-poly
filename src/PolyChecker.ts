export class Checker {
    private poly: { lat: number; lng: number; }[][];
    private readonly cache: { [key: string]: boolean } = {};
    private bound: { "minLat": number; "minLng": number; "maxLat": number; "maxLng": number; }[];

    constructor() {
        this.poly = [];
        this.cache = {};
        this.bound = [];
    }

    addPoly(draws: { lat: number; lng: number; }[]) {
        console.log(draws);
        // Array.prototype.push.apply(this.poly, Poly);
        this.poly.push(draws);
        this.bound.push(this.getBound(draws));
    }

    clear() {
        this.poly = [];
        this.bound = [];
        for (const key in this.cache) {
            delete this.cache[key];
        }
    }

    getBound(draws: { lat: number; lng: number; }[]) {
        let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;

        console.log(draws);
        for (const {lat, lng} of draws) {
            minLat = Math.min(minLat, lat);
            minLng = Math.min(minLng, lng);
            maxLat = Math.max(maxLat, lat);
            maxLng = Math.max(maxLng, lng);
        }
        return {minLat, minLng, maxLat, maxLng};
    }

    isPointContainsPoly(point: {
        lat: number;
        lng: number;
    }, poly: {
        lat: number;
        lng: number;
    }[], bound: {
        minLat: number;
        minLng: number;
        maxLat: number;
        maxLng: number;
    }) {
        const {lat, lng} = point;
        const key = `${lat},${lng}`;
        if (lat < bound.minLat || lat > bound.maxLat || lng < bound.minLng || lng > bound.maxLng) {
            // this.cache[key] = false;
            return false;
        }
        if (this.cache.hasOwnProperty(key)) return this.cache[key];

        // Ray-Casting Algorithm
        let isInside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const {lat: lat1, lng: lng1} = poly[i];
            const {lat: lat2, lng: lng2} = poly[j];
            if ((lat1 > lat) !== (lat2 > lat) && lng < ((lng2 - lng1) * (lat - lat1) / (lat2 - lat1) + lng1)) {
                isInside = !isInside;
            }
        }
        this.cache[key] = isInside;
        return isInside;
    }

    isPointContainsAnyPoly(point: { lat: number; lng: number; }) {
        for (let i = 0; i < this.poly.length; i++) {
            if (this.isPointContainsPoly(point, this.poly[i], this.bound[i])) {
                console.log()
                return true;
            }
        }
        return false;
    }

    checkLocation(data: IITC.LinkData) {
        const oPoint = {lat: data.oLatE6 / 1_000_000, lng: data.oLngE6 / 1_000_000};
        const dPoint = {lat: data.dLatE6 / 1_000_000, lng: data.dLngE6 / 1_000_000};
        return this.isPointContainsAnyPoly(oPoint) || this.isPointContainsAnyPoly(dPoint)
    }
}