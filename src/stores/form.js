import { defineStore } from "pinia";

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
      },
      successPayment: false
    }),
    getters:{
      totalServings: (state) => state.planData.serving * state.planData.mealPerWeek,
      totalPrice: (state) => state.totalServings * 6.99,
      totalPriceVoucher: (state) => (state.totalPrice * 80 / 100).toFixed(2)

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
      },
      updatePaymentStatus(status) {
        this.successPayment = status;
      }
    }
    
  });