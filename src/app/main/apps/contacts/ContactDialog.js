import { useForm } from '@fuse/hooks';
import FuseUtils from '@fuse/utils/FuseUtils';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from './store/actions';
// const csv=require('csvtojson')
import csv from 'csvtojson';
import { makeStyles } from '@material-ui/core/styles';
// import Button from '@material-ui/core/Button';
// import Dialog from '@material-ui/core/Dialog';
// import ListItemText from '@material-ui/core/ListItemText';
// import ListItem from '@material-ui/core/ListItem';
// import List from '@material-ui/core/List';
// import Divider from '@material-ui/core/Divider';
// import AppBar from '@material-ui/core/AppBar';
// import Toolbar from '@material-ui/core/Toolbar';
// import IconButton from '@material-ui/core/IconButton';
// import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import ReactJson from 'react-json-view'


const defaultFormState = {
	id: '',
	name: '',
	lastName: '',
	avatar: 'assets/images/avatars/profile.jpg',
	nickname: '',
	company: '',
	jobTitle: '',
	email: '',
	phone: '',
	address: '',
	birthday: '',
	notes: '',
};

const categoryMap = {
	funAndAdventure: {
		title: 'Fun & Adventure',
		description: 'Explore the area with local guides, and adventures organized by Easy Alfred!',
		icon: 'accessibility_new',
		image: '/assets/images/easyAlfred/funAndAdventure.jpg',
		serviceOptions: {},
	},
	spaLuxuryAndWellness: {
		title: 'Spa & Luxury',
		description: 'Relaxation, rest, or beauty? Necessity or luxury… Rest Easy. Alfred’s here to help.',
		icon: 'spa',
		image: 'assets/images/easyAlfred/spaAndLuxury.jpg',
		serviceOptions: {},
	},
	housekeeping: {
		title: 'Housekeeping',
		description: 'In need of a quick clean-up, launder, grocery run, or extra towels, let your Alfred know.',
		icon: 'local_laundry_service',
		image: 'assets/images/easyAlfred/housekeeping.jpg',
		serviceOptions: {},
	},
	foodAndBeverage: {
		title: 'Food & Beverage',
		description: 'Wine and dine with local chefs, caterers, and bartenders serving up their best cuisine without lifting a finger in the kitchen.',
		icon: 'fastfood',
		image: 'assets/images/easyAlfred/foodAndBeverage.jpg',
		serviceOptions: {},
	},
	giftCards: {
		title: 'Buy a gift card!',
		description: 'Support South Bay (LA) Businesses! Help us test our full process. Purchase a gift card to a local business to give away or gift yourself!',
		icon: 'card_membership',
		image: 'assets/images/easyAlfred/giftCards.jpg',
		serviceOptions: {},
	},
	petCare: {
		title: 'Pet Care',
		description: 'Let your pets rest easy on this trip! We connect you to their premier care.',
		icon: 'pets',
		image: 'assets/images/easyAlfred/petCare.jpg',
		serviceOptions: {},
	}
}

const useStyles = makeStyles((theme) => ({
	appBar: {
		position: 'relative',
	},
	title: {
		marginLeft: theme.spacing(2),
		flex: 1,
	},
}));

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});


function ContactDialog(props) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const contactDialog = useSelector(({ contactsApp }) => contactsApp.contacts.contactDialog);
	// console.log('data1234', contactDialog);
	// const getJsonIndented = (obj) => JSON.stringify(newObj, null, 4).replace(/["{[,\}\]]/g, "")
	// const getJsonIndented = (obj) => JSON.stringify(newObj, null, 4).replace(/["{[,\}\]]/g, "")
	const { form, handleChange, setForm } = useForm(defaultFormState);

	const [state, setState] = React.useState({
		csvString: '',
		dataString: '',
	});

	const initDialog = useCallback(() => {
		/**
		 * Dialog type: 'edit'
		 */
		if (contactDialog.type === 'edit' && contactDialog.data) {
			setForm({ ...contactDialog.data });
		}

		/**
		 * Dialog type: 'new'
		 */
		if (contactDialog.type === 'new') {
			setForm({
				...defaultFormState,
				...contactDialog.data,
				id: FuseUtils.generateGUID()
			});
		}
	}, [contactDialog.data, contactDialog.type, setForm]);

	useEffect(() => {
		/**
		 * After Dialog Open
		 */
		if (contactDialog.props.open) {
			initDialog();
			setState({ 
				csvString: '',
				dataString: '[]'
			});
		}
	}, [contactDialog.props.open, initDialog]);

	function closeComposeDialog() {
		return contactDialog.type === 'edit'
			? dispatch(Actions.closeEditContactDialog())
			: dispatch(Actions.closeNewContactDialog());
	}

	function canBeSubmitted() {
		return form.name.length > 0 &&
		state.csvString.length > 0
	}

	function canBeSubmittedEdit() {
		return form.name.length > 0
	}

	function handleSubmit(event) {
		event.preventDefault();
		console.log('form', !!state.csvString, contactDialog.type)
		if (contactDialog.type === 'new') {
			console.log('zzz adding services');
			csv({
				noheader: true,
				output: "csv"
			})
			.fromString(state.csvString)
			.then((data) => {
				const serviceObject = buildServiceData(data)
				dispatch(Actions.addContact(serviceObject));
				closeComposeDialog();
			})
		} else {
			if (!!state.csvString){
				console.log('zzz updated services');
				csv({
					noheader: true,
					output: "csv"
				})
					.fromString(state.csvString)
					.then((data) => {
						const serviceObject = buildServiceData(data)
						dispatch(Actions.updateServices(serviceObject));
						closeComposeDialog();
					})
			} else {
				console.log('zzz updated services meta');
				dispatch(Actions.updateContact(form));
				closeComposeDialog();
			}
		}
		
	}

	function handleRemove(){
		dispatch(Actions.removeContact(form.id));
		closeComposeDialog();
	}

	function buildServiceData(arr) {
		const serviceMap = {}
		const { name: serviceId, nickname: subRegion, lastName: region, notes } = form

		function buildSubServiceData(arr) {
			if (!arr) return null
			let obj = {};
			arr.split(',').forEach((item) => {
				const subServiceId = FuseUtils.generateGUID(item)
				const subServiceTitle = item.trim();
				obj[subServiceId] = {
					subServiceId,
					subServiceTitle,
				}
			})
			return obj
		}

		for (let i = 0; i < arr.length; i++) {
			const element = arr[i]
			if (i > 0){
				const category = element[0]
				if (!serviceMap[category]) {
					serviceMap[category] = categoryMap[category]
				}
				const subCategory = element[1]
				const serviceId =  i + FuseUtils.generateGUID(subCategory)
				const subServiceOptions = buildSubServiceData(element[8]);
				const priceQuantifier1 = element[6] === 'none' ? '' : element[6]
				const priceQuantifier2 = element[7] === 'none' ? '' : element[7]
				
				if (subServiceOptions){
					categoryMap[category]['serviceOptions'][serviceId] = {
						price: element[4].replace('$','').trim(),
						priceMax: element[3].replace('$', '').trim(),
						priceMin: element[2].replace('$', '').trim(),
						priceType: element[5],

						serviceLabel: element[9],
						subServiceLabel: element[10],
						priceQuantifier1Label: element[11],
						priceQuantifier2Label: element[12],
						priceLabel: element[13],
						requestsLabel: element[14],

						isConfirmed: false,
						priceQuantifier1,
						priceQuantifier2,
						serviceId: serviceId,
						serviceTitle: subCategory,
						subServiceOptions,
					}
				} else {
					categoryMap[category]['serviceOptions'][serviceId] = {
						price: element[4].replace('$','').trim(),
						priceMax: element[3].replace('$', '').trim(),
						priceMin: element[2].replace('$', '').trim(),
						priceType: element[5],
						
						serviceLabel: element[9],
						subServiceLabel: element[10],
						priceQuantifier1Label: element[11],
						priceQuantifier2Label: element[12],
						priceLabel: element[13],
						requestsLabel: element[14],

						isConfirmed: false,
						priceQuantifier1,
						priceQuantifier2,
						serviceId: serviceId,
						serviceTitle: subCategory,
					}
				}
			}
		}
		return {
			[serviceId]: {
				serviceId,
				region,
				subRegion,
				notes,
				data: serviceMap
			}
		}
	}

	function handleUploadChange(e) {
		const file = e.target.files[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();

		reader.readAsBinaryString(file);

		reader.onload = () => {
			setState({ csvString: reader.result });
		};

		reader.onerror = (error) => {
			console.log('error on load csv', error);
		};
	}

	const [open, setOpen] = React.useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<div >
		<Dialog
			classes={{
				paper: 'm-24'
			}}
			{...contactDialog.props}
			onClose={closeComposeDialog}
			fullWidth
			maxWidth="xs"
		>
			<AppBar position="static" elevation={1}>
				<Toolbar className="flex w-full">
						{contactDialog.type === 'edit' && <Button
							variant="contained"
							color="secondary"
							onClick={handleClickOpen}
						>
							View Data
						</Button>}
				</Toolbar>
				<div className="flex flex-col items-center justify-center pb-24">
					<Avatar className="w-96 h-96" alt="contact avatar" src='assets/images/avatars/profile.jpg' />
					{contactDialog.type === 'edit' && (
						<Typography variant="h6" color="inherit" className="pt-8">
							{form.name}
						</Typography>
					)}
				</div>
				
			</AppBar>
			<form noValidate onSubmit={handleSubmit} className="flex flex-col md:overflow-hidden">
				<DialogContent classes={{ root: 'p-24' }}>

					<div className="flex">
						<div className="min-w-48 pt-20">
								{form.name ? <Icon className="text-green text-20">check_circle</Icon> : <Icon color="action">check</Icon>}
						</div>
						<TextField
							className="mb-24"
							label="Service Id"
							autoFocus
							id="name"
							name="name"
							value={form.name}
							onChange={handleChange}
							variant="outlined"
							required
							fullWidth
							disabled={contactDialog.type !== 'new'}
						/>
					</div>

					<div className="flex">
						<div className="min-w-48 pt-2">
								{form.lastName ? <Icon className="text-green text-20">check_circle</Icon> : <Icon color="action">check</Icon>}
						</div>
						<TextField
							className="mb-24"
							label="Region"
							id="lastName"
							name="lastName"
							value={form.lastName}
							onChange={handleChange}
							variant="outlined"
							fullWidth
						/>
					</div>

					<div className="flex">
						<div className="min-w-48 pt-20">
								{form.nickname ? <Icon className="text-green text-20">check_circle</Icon> : <Icon color="action">check</Icon>}
						</div>
						<TextField
							className="mb-24"
							label="Sub Region"
							id="nickname"
							name="nickname"
							value={form.nickname}
							onChange={handleChange}
							variant="outlined"
							fullWidth
						/>
					</div>

					<div className="flex">
						<div className="min-w-48 pt-20">
								{form.notes ? <Icon className="text-green text-20">check_circle</Icon> : <Icon color="action">check</Icon>}
						</div>
						<TextField
							className="mb-24"
							label="Notes"
							id="notes"
							name="notes"
							value={form.notes}
							onChange={handleChange}
							variant="outlined"
							multiline
							rows={3}
							fullWidth
						/>
					</div>

					<div className="flex">
						<div className="min-w-48 pt-20">
								{state.csvString.length > 0 ? <Icon className="text-green text-20">check_circle</Icon> : <Icon color="action">check</Icon>}
						</div>
							<label htmlFor="button-file">
								<input disabled={state.csvString.length > 0} accept=".csv" className="hidden" id="button-file" type="file" onChange={handleUploadChange} />
								<IconButton disabled={state.csvString.length > 0} component="span">
								<Icon fontSize="large">attach_file</Icon>
								{contactDialog.type === 'new' ? 'Upload CSV' : 'Update CSV'} 
							</IconButton>
						</label>
					</div>
				</DialogContent>

				{contactDialog.type === 'new' ? (
					<DialogActions className="justify-between p-8">
						<div className="px-16">
							<Button
								variant="contained"
								color="primary"
								// onClick={handleSubmit}
								type="submit"
								disabled={!canBeSubmitted()}
							>
								Add
							</Button>
							{' '}
							<Button
								variant="contained"
								color="primary"
								onClick={closeComposeDialog}
								>
								Cancel
							</Button>
								</div>
					</DialogActions>
				) : (

					<DialogActions className="justify-between p-8">
						<div className="px-16">
							<Button
								variant="contained"
								
								color="primary"
								type="submit"
								// onClick={handleSubmit}
								disabled={!canBeSubmittedEdit()}
								>
								Save
							</Button>
							{' '}
							<Button
								variant="contained"
								color="primary"
								onClick={closeComposeDialog}
								>
								Cancel
							</Button>
						</div>
						<IconButton onClick={handleRemove}>
							<Icon>delete</Icon>
						</IconButton>
					</DialogActions>

				)}
			</form>
		</Dialog>

			<Dialog  fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
				<AppBar className={classes.appBar}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
							<CloseIcon />
						</IconButton>
						<Typography variant="h6" className={classes.title}>
						JSON service data
            </Typography>
						<Button autoFocus color="inherit" onClick={handleClose}>
						close
            </Button>
					</Toolbar>
				</AppBar>
				<ReactJson src={form.data} 
				collapsed
				name={false} 
				displayDataTypes={false}
				enableClipboard={false}/>
			</Dialog>
			</div>
	);
}

export default ContactDialog;
