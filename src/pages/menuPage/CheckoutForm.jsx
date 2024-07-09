import { CardElement, useElements, useStripe} from '@stripe/react-stripe-js';
import React, { useState, useEffect } from 'react'
import { FaPaypal } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';


const CheckoutForm = ({price, cart}) => {
    const stripe = useStripe();
    const elements = useElements();
    const {user} = useAuth();

    const axiosSecure = useAxiosSecure();

    const [cardError, setCardError] =useState('')
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        if(typeof price !== 'number' || price<1){
            return;
        }
        axiosSecure.post('/create-payment-intent',{price})
        .then(res=>{
            setClientSecret(res.data.clientSecret);
        })
      }, [price, axiosSecure]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if(!stripe|| !elements){
            return;
        }
        const card = elements.getElement(CardElement);

    if (card == null) {
      return;
    }
    const {error, paymentMethod} = await stripe.createPaymentMethod({
        type: 'card',
        card,
      });
  
      if (error) {
        console.log('[error]', error);
        setCardError(error.message)
      } else {
        setCardError("Success!!");
        console.log('[PaymentMethod]', paymentMethod);
      }

      const {paymentIntent, error: confirmErrror} = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: card,
            billing_details: {
              name: user?.displayName || 'anonymous',
              email: user?.email || 'unknown'
            },
          },
        });

        if(confirmErrror){
            console.log(confirmErrror)
        }console.log(paymentIntent)
        if(paymentIntent.status === "succeeded"){
            setCardError(`Your TransactionID is : ${paymentIntent.id}`)
                alert("Payment Successful !!!");
        }

    };
  return (
    <div className='flex flex-col sm:flex-row justify-start items-start gap-8'>
        <div className='md:w-1/2 w-full space-y-3'>
            <h4 className='text-lg font-semibold'>Order Summary</h4>
            <p>Total Price : ${price}</p>
            <p>Number of Items : {cart.length}</p>
        </div>

        <div className='md:w-1/3 w-full space-y-5 card bg-yellow-100 w-full max-w-sm shrink-0 shadow-2xl px-4 py-8'>
        <h4 className='text-lg font-bold'>Process Your Payment</h4>
        <h5 className='font-medium'>Credit/Debit Card</h5>

        <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      />
      <button type="submit" disabled={!stripe} className='btn btn-sm mt-5 btn-primary w-full text-white'>
        Pay
      </button>
    </form>
    {
        cardError ? <p className='text-red-500'>{cardError}</p> : ""
    }

    <div className='mt-2 text-center'>
        <hr />
        <button type="submit" className='btn btn-sm mt-5 bg-orange-400 text-white'>
        <FaPaypal /> Pay with UPI 
      </button>
    </div>
        
    </div>
    </div>
  )
}

export default CheckoutForm