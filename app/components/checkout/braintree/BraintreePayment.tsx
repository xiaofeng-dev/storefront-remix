import React, { FormEvent, useEffect, useState } from 'react'
import dropin, { Dropin } from "braintree-web-drop-in"
import { sdk } from '~/graphqlWrapper';
import { Order } from '~/generated/graphql';
import { classNames } from '~/utils/class-names';
import { useSubmit, useTransition } from "@remix-run/react";
import { Form, useActionData } from '@remix-run/react';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import {
    addPaymentToOrder,
    createStripePaymentIntent,
    generateBraintreeClientToken,
    getEligiblePaymentMethods,
    getNextOrderStates,
    transitionOrderToState,
} from '~/providers/checkout/checkout';
import { DownloadIcon } from '@heroicons/react/solid';

export function BraintreeDropIn(props: { show: boolean, authorization: string, fullAmount: number, onPaymentCompleted: Function }) {
    const { show, authorization, fullAmount, onPaymentCompleted } = props;

    const [braintreeInstance, setBraintreeInstance] = useState<Dropin>();
    const [enablePaymentButton, setEnablePaymentButton] = useState<boolean>();
    const [processing, setProcessing] = useState<boolean>(true);

    const submit = useSubmit();

    const submitPayment = async () => {
        setProcessing(true);
        if (braintreeInstance) {
            const result = await braintreeInstance.requestPaymentMethod();

            const formData = new FormData();
            formData.set("paymentMethodCode", "braintree");
            formData.set("paymentNonce", result.nonce);

            let request: Request;
            request = new Request("");

            await addPaymentToOrder({ method: "braintree", metadata: result }, { request });

            submit(formData, { method: "post" });
        }
    };

    useEffect(() => {
        if (show) {
            const initializeBraintree = () => dropin.create({
                authorization: authorization,
                container: '#braintree-drop-in-div',
                paypal: {
                    flow: 'checkout',
                    amount: 10,
                    currency: 'EUR',
                }
            }, function (error, instance) {
                if (error)
                    console.error(error)
                else if (instance != null) {
                    setBraintreeInstance(instance);
                    instance.on("paymentMethodRequestable", (payload) => {
                        setEnablePaymentButton(true);
                    });

                    setProcessing(false);
                }
            });

            if (braintreeInstance) {
                braintreeInstance
                    .teardown()
                    .then(() => {
                        initializeBraintree();
                    });
            } else {
                initializeBraintree();
            }
        }
    }, [show])

    return (
        <div
            style={{ display: `${show ? "block" : "none"}` }}
            className={"w-full h-full"}
        >
            <div
                id={"braintree-drop-in-div"}
            />

            <input
                type="hidden"
                name="paymentMethodCode"
                value={"braintree"}
            />
            <button onClick={submitPayment}
                className={"braintreePayButton w-full bg-primary-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500"}
                disabled={!braintreeInstance || !enablePaymentButton}>

                {
                    "Pay"
                }
                {processing ? (<svg aria-hidden="true" className="ml-3 w-4 h-4 text-indigo-100 animate-spin dark:text-gray-100 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>) : ""}
            </button>
        </div>
    )
}