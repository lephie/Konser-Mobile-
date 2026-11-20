import { orderApi } from "./orderApi";
import * as WebBrowser from 'expo-web-browser';

export type payOutCome = 'paid' | 'pending' | 'failed';

const sleep = (ms: number) => new Promise<void>(r =>setTimeout(r, ms));

export async function waitForMyPaymentStatus(
    orderId: number,
    tries = 5,
    delayMs = 2000
) : Promise<payOutCome> {
    for(let i = 0; i < tries; i++) {
       const res = await orderApi.checkStatus(orderId);
       const status = res?.order_status ?? res?.status;

       if(status === 'paid') return 'paid';
       if(status === 'expired' || status === 'cancelled') return 'failed';
       
       if(i < tries - 1) await sleep(delayMs);
    }
    return 'pending';
}

export async function payOrder(orderId: number): Promise<payOutCome> {
    const result = await orderApi.pay(orderId);
    const redirectUrl = result?.redirect_url;
    if(!redirectUrl) throw new Error('Link pembayaran tidak ditemukan ')

        await WebBrowser.openBrowserAsync(redirectUrl);
        return waitForMyPaymentStatus(orderId)
}
