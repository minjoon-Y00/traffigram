function TgFilterController($scope, data) {

	let user_filter = null;

	let rating_conf = null;
	let rating_num_conf = null;
	let price_conf = null;

	let rating_metrics = null;
	let rating_num_metrics = null;
	let price_metrics = null;

	const rating_pref = [];
	const rating_num_pref = [];
	const price_pref = [];

	let rating_handler = null;
	let rating_num_handler = null;
	let price_handler = null;

	/**
	 * Entry Point
	 */
	initVars();
	initPosition();
	QuantCDQInit('rating_root', rating_conf, rating_metrics, rating_pref, rating_handler);
	QuantCDQInit('rating_num_root', rating_num_conf, rating_num_metrics, rating_num_pref, rating_num_handler);
	OrdCDQInit('price_root', price_conf, price_metrics, price_pref, price_handler);

	/**
	 * Functions
	 */

	function initVars() {
		const width = 230;	

		user_filter = [
			{name: 'ratings', 0: 0, 1: 5},
			{name: 'numRatings', 0: 0, 1: 1000},
			{name: 'priceRange', 0: 0, 1: 4},
		];

		rating_conf = {
			criterion_name: 'Ratings',
			criterion_id: 'ratings',
			interval: 0.5,
			tick_interval: 0.5,
			range: [0, 5],
			range_MinMax: [true, false],
			default_selection: [user_filter[0][0], user_filter[0][1]], //[3, 5],
			anonymize: false,
		};

		rating_metrics = {
			h_space_top: 20,
			h_subject: 16,
			h_space_subject_txt: 10,
			h_txt: 15,
			h_tick: 12,
			h_space_between: 5,
			h_me: 16,
			h_space_me_others: 20,
			h_other: 25,
			h_space_bottom: 20,
			w_space_padding: 20,
			w_range: width - 2 * 20,
			bar_radius : 10,
			handle_radius : 5,
			handle_width: 10,
		};

		rating_handler = {
			onSelectChange: onRatingChanged,
			socketHandler: function (setPreference, initialSelection) {}
		};

		rating_num_conf = {
			criterion_name: 'Number of ratings',
			criterion_id: 'num_rating',
			interval: 200,
			tick_interval: 200,
			range: [0, 1000],
			range_MinMax: [true, true],
			default_selection: [user_filter[1][0], user_filter[1][1]], //[200, 600],
			anonymize: false,
		};

		rating_num_metrics = {
			h_space_top: 20,
			h_subject: 16,
			h_space_subject_txt: 10,
			h_txt: 15,
			h_tick: 12,
			h_space_between: 5,
			h_me: 16,
			h_space_me_others: 20,
			h_other: 25,
			h_space_bottom: 20,
			w_space_padding: 20,
			w_range: width - 2 * 20,
			bar_radius : 10,
			handle_radius : 5,
			handle_width: 10,
		};

		rating_num_handler = {
			onSelectChange: onNumRatingChanged,
			socketHandler: function (setPreference, initialSelection) {}
		};

		price_conf = {
			criterion_name: 'Price Range',
			criterion_id: 'price_range',
			tick_num: 5,
			label: ["$", "$$", "$$$", "$$$$"],
			range_MinMax: [true, true],
			default_selection: [user_filter[2][0], user_filter[2][1]], //[1, 2],
			anonymize: false,
		};

		price_metrics = {
			h_space_top : 20,
			h_subject: 16,
			h_space_subject_txt: 10,
			h_txt: 15,
			h_tick: 12,
			h_space_between: 5,
			h_me: 16,
			h_space_me_others: 20,
			h_other: 25,
			h_space_bottom: 20,
			w_space_padding: 20,
			w_between_tick: (width - 2*20)/4,
			bar_radius : 10,
			handle_radius : 5,
			handle_width: 10,
		};

		price_handler = {
			onSelectChange: onPriceChanged,
			socketHandler: function (setPreference, initialSelection) {}
		};
	}

	function initPosition() {
		$("#content_filter").css({
			top: data.hScreen - 400,
		});

		$("#content_main_filterarea").css({
			width: data.wPanel,
			height: 200,
		});

		$("#rating_root").css({
			top: 30,
		});

		$("#rating_num_root").css({
			top: 150,
		});	

		$("#price_root").css({
			top: 260,
		});
	}

	function onRatingChanged(val) {
		//constructList();
		user_filter[0]["0"] = val[0];
		user_filter[0]["1"] = val[1];
		//tg.filter('ratings', val[0], val[1]);
		console.log('rating_handler:', val);
	}

	function onNumRatingChanged(val) {
		//constructList();
		user_filter[1]["0"] = val[0];
		user_filter[1]["1"] = val[1];
		//tg.filter('ratings', val[0], val[1]);
		console.log('rating_num_handler:', val);
	}

	function onPriceChanged(val) {
		//constructList();
		user_filter[2]["0"] = val[0];
		user_filter[2]["1"] = val[1];
		//tg.filter('ratings', val[0], val[1]);
		console.log('price_handler:', val);
	}
}
