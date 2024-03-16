import { AcquisitionMethod } from "@/api/checkout.types";
import { ShoppingCartEntry } from "@/api/product.types";
import { UserAddress } from "@/api/user.types";
import {
	Button,
	Input,
	Radio,
	RadioGroup,
	Select,
	SelectItem,
} from "@nextui-org/react";
import React, { useState } from "react";

const provinces = [
	"BC",
	"AB",
	"SK",
	"MB",
	"QC",
	"ON",
	"NL",
	"NB",
	"NS",
	"PEI",
	"YT",
	"NT",
	"NU",
];

type DeliveryDetailsProps = {
	data: undefined | ShoppingCartEntry[];
	onInfoSubmit: (
		acquisitionMethod: AcquisitionMethod,
		deliveryDetails?: UserAddress
	) => void;
	onInfoEdit: () => void;
};

// TODO: figure out a better way to manage the form and get the values when submitting
export function DeliveryDetails({
	data,
	onInfoSubmit,
	onInfoEdit,
}: DeliveryDetailsProps) {
	const [selectedOption, setSelectedOption] = useState("delivery");
	const [formSubmitted, setFormSubmitted] = useState(false);

	const [deliveryFormData, setDeliveryFormData] = useState<UserAddress>({
		street_address: "",
		postal_code: "",
		city: "",
		province: "",
	});

	const handleInputChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
	) => {
		const { name, value } = event.target;

		setDeliveryFormData({ ...deliveryFormData, [name]: value });
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (selectedOption == "pickup") {
			onInfoSubmit("pickup");
			setFormSubmitted(true);
		} else {
			let validForm = true;
			Object.values(deliveryFormData).forEach((value, index) => {
				if (value === "") {
					validForm = false;
				}
			});

			if (validForm) {
				onInfoSubmit("delivery", deliveryFormData);
				setFormSubmitted(true);
			}
		}
	};
	
	// a form that asks for the user's address
	function getDeliveryDetails(): React.JSX.Element {
		return (
			<div>
				<p className="mb-3">
					(Please enter your address so we can calculate shipping costs, your
					actual shipping address will be provided through PayPal)
				</p>
				<p className="mb-1">Shipping Details:</p>
				<form onSubmit={handleSubmit} className="flex flex-col">
					<Input
						className="mb-1"
						label="Street Address"
						name="street_address"
						placeholder="Enter your street address"
						isRequired
						onChange={handleInputChange}
						defaultValue={deliveryFormData.street_address}
					/>
					<Input
						className="mb-1"
						label="Postal Code"
						name="postal_code"
						placeholder="Enter your postal code"
						isRequired
						onChange={handleInputChange}
						defaultValue={deliveryFormData.postal_code}
					/>
					<Input
						className="mb-1"
						label="City"
						name="city"
						placeholder="Enter your city"
						isRequired
						onChange={handleInputChange}
						defaultValue={deliveryFormData.city}
					/>
					<Select
						label="Select a province/territory"
						name="province"
						className="max-w-xs mb-1"
						isRequired
						onChange={handleInputChange}
						defaultSelectedKeys={[deliveryFormData.province]}
					>
						{provinces.map((province) => (
							<SelectItem key={province} value={province}>
								{province}
							</SelectItem>
						))}
					</Select>
					<Button
						type="submit"
						color="primary"
						className="w-fit self-center mt-3"
					>
						Save
					</Button>
				</form>
			</div>
		);
	}

	// confirms with the user the address of warehouse(s) to pick up items from
	function getPickupDetails(): React.JSX.Element {
		return (
			<div>
				<p>Addresses of warehouses to pick items:</p>
				<p className="mt-4 text-center">TODO</p>
				<Button
					type="submit"
					color="primary"
					className="w-fit self-center mt-3"
					onClick={() => {
						setFormSubmitted(true);
						onInfoSubmit("pickup");
					}}
				>
					Save
				</Button>
			</div>
		);
	}

	// displays the address info that the user entered previously
	function displayDeliveryDetails(): React.JSX.Element {
		return (
			<div>
				<p className="mb-1">Shipping Details:</p>
				<p>Address: {deliveryFormData.street_address}</p>
				<p>Postal Code: {deliveryFormData.postal_code}</p>
				<p>City: {deliveryFormData.city}</p>
				<p>Province: {deliveryFormData.province}</p>
				<Button
					type="submit"
					className="w-fit self-center mt-3"
					onClick={() => {
						setFormSubmitted(false);
						onInfoEdit();
					}}
				>
					Edit
				</Button>
			</div>
		);
	}

	// displays the pickup info that the user confirmed previously
	function displayPickupDetails(): React.JSX.Element {
		return (
			<div>
				<p>Addresses of warehouses to pick items:</p>
				<p className="mt-4 text-center">TODO</p>
				<Button
					type="submit"
					className="w-fit self-center mt-3"
					onClick={() => {
						setFormSubmitted(false);
						onInfoEdit();
					}}
				>
					Edit
				</Button>
			</div>
		);
	}

	// user can choose either delivery or pickup and confirm/fill out a form depending on the option chosen
	// after the form is submitted, displays a confirmation of the info that the user entered/confirmed for either delivery or pickup
	return !formSubmitted ? (
		<div>
			<h3 className="text-xl flex justify-center mb-2">
				Choose how to receive your purchase:
			</h3>
			<div className="flex justify-center mb-2">
				<RadioGroup
					onValueChange={setSelectedOption}
					defaultValue={selectedOption}
				>
					<Radio value="delivery">Delivery</Radio>
					<Radio value="pickup">Pickup</Radio>
				</RadioGroup>
			</div>
			{selectedOption == "delivery" && getDeliveryDetails()}
			{selectedOption == "pickup" && getPickupDetails()}
		</div>
	) : (
		<div>
			{selectedOption == "delivery" && displayDeliveryDetails()}
			{selectedOption == "pickup" && displayPickupDetails()}
		</div>
	);
}