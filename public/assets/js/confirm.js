'use strict';

var app2 = new Vue({
  el: '#app-2',
  data: {
    email: '',
    submitError: '',
    submitSuccess: false,
    phone: '',
    token: ''
  },
  methods: {
    submitEmail: function(event) {
      event.preventDefault();
      this.submitSuccess = false;
      this.submitError   = '';

      axios.post('http://localhost:3089/api/v1/register', {email: this.email})
        .then(res => {
          // show notification
          this.submitSuccess = true;
          // reset form
          this.email = '';
        })
        .catch(err => {
          if (err.response.data.message.indexOf('Email') !== -1) {
            this.submitError = 'Ta email je že registriran. Preveri svoj e-poštni predal.';
          } else {
            this.submitError = 'Prišlo je do napake. Preveri email in poskusi ponovno.';
          }
        });
    },

    submitPhone: function(event) {
      event.preventDefault();
      this.submitSuccess = false;
      this.submitError   = '';

      var phone = this.phone.replace(/\s+/g, '');

      axios.post(`http://localhost:3089/api/v1/confirm/phone/${this.token}`, {phone: phone})
        .then(res => {
          // show notification
          this.submitSuccess = true;
          // reset form
          this.phone = '';
        })
        .catch(err => {
          if (err.response.data.message.indexOf('Phone') !== -1) {
            this.submitError = 'Ta telefonska številka je že registrirana.';
          } else {
            this.submitError = 'Prišlo je do napake. Preveri format telefonske in poskusi ponovno.';
          }
        });
    }
  }
});