"use client";

import { getShoppingCartProducts } from "@/api/shoppingCart";
import CheckoutItemsList from "@/components/CheckoutItemsList/CheckoutItemsList";
import OrderTotal from "@/components/OrderTotal/OrderTotal";
import DeliveryDetails from "@/components/AcquisitionDetails/AcquisitionDetails";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { UserAddress } from "@/api/user.type";
import { AcquisitionMethod } from "@/api/checkout.types";

// TODO: refactor this page and related components somehow?
function page() {
	const [acquisitionMethod, setAcquisitionMethod] =
		useState<AcquisitionMethod>();
	const [userAddress, setUserAddress] = useState<UserAddress>();

	const { isLoading, error, data } = useQuery({
		queryKey: ["shopping cart"],
		queryFn: getShoppingCartProducts,
		refetchOnMount: "always",
	});

	function onInfoSubmit(
		acquisitionMethod: AcquisitionMethod,
		deliveryDetails?: UserAddress
	) {
		if (acquisitionMethod == "delivery") {
			setUserAddress(deliveryDetails);
			setAcquisitionMethod("delivery");
		} else {
			setAcquisitionMethod("pickup");
		}
	}

	function onInfoEdit() {
		setAcquisitionMethod(undefined);
	}

	return (
		<>
			<Link href={"/"} className="text-blue-600 m-4">
				&lt;- Back to Home
			</Link>
			<main className="flex flex-col items-center mb-16">
				<h2 className="mt-4 mx-4 text-2xl">Check out</h2>
				<div className="flex flex-1 justify-center w-full mb-10 mt-8">
					<div className="w-1/3 mx-4">
						<CheckoutItemsList data={data} />
					</div>
					<div className="w-1/3 mx-4">
						<DeliveryDetails
							data={data}
							onInfoSubmit={onInfoSubmit}
							onInfoEdit={onInfoEdit}
						/>
					</div>
					<div className="flex flex-col w-1/3 mx-4">
						<OrderTotal data={data} acquisitionMethod={acquisitionMethod} />
					</div>
				</div>
			</main>
		</>
	);
}

export default page;