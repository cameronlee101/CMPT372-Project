"use client";

import { Product } from "@/api/product.types";
import { Card, CardBody } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

type WishlistItemProps = {
	item: Product;
	onItemRemove: (product_id: number) => void;
};

export function WishlistItem({ item, onItemRemove }: WishlistItemProps) {
	const router = useRouter();

	function handleItemClick(event: React.MouseEvent) {
		router.push(`/product/${item.product_id}`);
	}

	function handleItemRemove(event: React.MouseEvent) {
		event.stopPropagation();
		onItemRemove(item.product_id);
	}

	// TODO: make a clear distinction between the two onclicks
	return (
		<div className="h-fit w-full">
			<Card className="h-auto w-full" isPressable onClick={handleItemClick}>
				<CardBody className="flex flex-row justify-between items-end">
					<div className="flex items-center">
						<Image
							src={item.img_src}
							alt={`${item.product_name} image`}
							width={50}
							height={50}
						/>
						<div>
							<p>{item.product_name}</p>
							<p>Price: ${item.base_price.toFixed(2)}</p>
						</div>
					</div>
					<div>
						<p
							className="text-blue-600 text-sm cursor-pointer"
							onClick={handleItemRemove}
						>
							Remove
						</p>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}