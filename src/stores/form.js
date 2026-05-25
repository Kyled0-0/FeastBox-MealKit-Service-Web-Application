import { defineStore } from "pinia";

export const PRICE_PER_SERVING = 6.99
export const VOUCHER_DISCOUNT = 0.8

export const useMealForm = defineStore('MealForm', {
    state: () => ({
      planData:{
        preference:'Everyday Variety',
        serving: 2,
        mealPerWeek:2,
      },
      deliveryData: {
        firstName: '',
        lastName: '',
        address:'',
        postcode:'',
        suburb:'',
        state:'NSW',
        phone:'',
        deliveryOption: 'Leave it at front door',
        deliveryDate: '',
        deliverySlot: '12:00 AM - 07:00 AM'
      },
      paymentData:{
        cardName:'',
        cardNumber:'',
        expiryDate:'',
        cvc:'',
        voucher:'',
        terms: false
      }
    }),
    getters:{
      totalServings: (state) => state.planData.serving * state.planData.mealPerWeek,
      totalPrice: (state) => state.totalServings * PRICE_PER_SERVING,
      totalPriceVoucher: (state) => state.totalPrice * VOUCHER_DISCOUNT

    },

    actions: {
      updatePlan(field, value) {
        this.planData[field] = value;
      },
      updateDelivery(field,value){
        this.deliveryData[field] = value;
      },
      updatePayment(field,value){
        this.paymentData[field] = value;
      }
    }
    
  });