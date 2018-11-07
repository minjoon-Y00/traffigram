

/*
 * Main Vue Object
 */
const vm = new Vue({
  el: '#dcApp',
  data: {
  	stage: 'f1_1',
  	cb1_1: false,
  	tx1_2: '',
  	tx1_2_answer: '6',
  	tx1_2_wrong: false,
  	cb1_4: false,
  	cb1_5: false,
  	tx2_3: '',
  	tx2_3_answer: '6',
  	tx2_3_wrong: false,
  	tx3_3: '',
  	tx3_3_answer: '6',
  	tx3_3_wrong: false,
  	tx4_3: '',
  	tx4_3_answer: '6',
  	tx4_3_wrong: false,
  	tx5_3: '',
  	tx5_3_answer: '6',
  	tx5_3_wrong: false,
  	tx9_3: '',
  	tx9_3_answer: '6',
  	tx9_3_wrong: false,
  },
  watch: {
    cb1_1: function(val) {
      //console.log(val);
    }
  },
  created: function() {
  	const params = this.getParameters();
  	if (params.stage) this.stage = params.stage;
  },
  methods: {
  	onClick: function(btn) {
  		switch(btn) {
  			case 'cb1_1':
  				if (this.cb1_1) this.stage = 'f1_2';
  				break;
  			case 'cb1_2':
  				if (this.tx1_2 == this.tx1_2_answer) this.stage = 'f1_3';
  				else this.tx1_2_wrong = true;
  				break;
  			case 'cb1_3':
  				this.stage = 'f1_4';
  				break;
  			case 'cb1_4':
  				if (this.cb1_4) this.stage = 'f1_5';
  				break;
  			case 'cb1_5':
  				if (this.cb1_5) this.stage = 'f2_1';
  				break;
  			case 'cb2_1':
  				this.stage = 'f2_2';
  				break;
  			case 'cb2_2':
  				this.stage = 'f2_3';
  				break;
  			case 'cb2_3':
  				if (this.tx2_3 == this.tx2_3_answer) this.stage = 'f3_1';
  				else this.tx2_3_wrong = true;
  				break;
  			case 'cb3_1':
  				this.stage = 'f3_2';
  				break;
  			case 'cb3_2':
  				this.stage = 'f3_3';
  				break;
  			case 'cb3_3':
  				if (this.tx3_3 == this.tx3_3_answer) this.stage = 'f4_1';
  				else this.tx3_3_wrong = true;
  				break;
  			case 'cb4_1':
  				this.stage = 'f4_2';
  				break;
  			case 'cb4_2':
  				this.stage = 'f4_3';
  				break;
  			case 'cb4_3':
  				if (this.tx4_3 == this.tx4_3_answer) this.stage = 'f5_1';
  				else this.tx4_3_wrong = true;
  				break;
  			case 'cb5_1':
  				this.stage = 'f5_2';
  				break;
  			case 'cb5_2':
  				this.stage = 'f5_3';
  				break;
  			case 'cb5_3':
  				if (this.tx5_3 == this.tx5_3_answer) this.stage = 'f6_1';
  				else this.tx5_3_wrong = true;
  				break;
  			case 'cb6_1':
  				this.stage = 'f6_2';
  				break;
  			case 'cb6_2':
  				this.stage = 'f7_1';
  				break;
  			case 'cb7_1':
  				this.stage = 'f7_2';
  				break;
  			case 'cb7_2':
  				this.stage = 'f8_1';
  				break;
  			case 'cb8_1':
  				this.stage = 'f9_1';
  				break;
  			case 'cb9_1':
  				this.stage = 'f9_2';
  				break;
  			case 'cb9_2':
  				this.stage = 'f9_3';
  				break;
  			case 'cb9_3':
  				if (this.tx9_3 == this.tx9_3_answer) this.stage = 'f10_1';
  				else this.tx9_3_wrong = true;
  				break;
  			case 'cb10_1':
  				//this.stage = 'f9_1';
  				break;
  		}
  	},
  	getParameters: function() {
			const transformToAssocArray = function(prmstr) {
		    let params = {};
		    let prmarr = prmstr.split("&");
		    for (let i = 0; i < prmarr.length; i++) {
		      const tmparr = prmarr[i].split("=");
		      params[tmparr[0]] = tmparr[1];
		    }
		    return params;
			}
			const prmstr = window.location.search.substr(1);
		  return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
		}
  },
});