"use client";

import { getCategoryProducts } from "@/api/product";
import { getPageEnumVal } from "@/app/pages";
import ItemGrid from "@/components/ItemGrid/ItemGrid";
import TopNavbar from "@/components/TopNavbar/TopNavbar";
import { Pagination } from "@nextui-org/react";

function page({ params }: { params: { categoryName: string } }) {
	const categoryNameEnumVal = getPageEnumVal(params.categoryName);

	if (categoryNameEnumVal) {
		return (
			<>
				<TopNavbar highlightLink={categoryNameEnumVal} />
				<main className="flex flex-col items-center mb-16">
					<div className="flex justify-center items-center text-center w-full h-60 border border-blue-500">
						Representative image
					</div>
					<div className="flex flex-1 w-full mb-10">
						<div
							className="flex justify-center items-center text-center border border-blue-500 w-80"
							style={{ height: "800px" }}
						>
							Filters
						</div>
						<ItemGrid
							getContents={getCategoryProducts}
							filters={[categoryNameEnumVal.toString()]}
						/>
					</div>
					<div className="flex justify-center items-center text-center">
						<Pagination showControls total={10} initialPage={1} />
					</div>
				</main>
			</>
		);
	} else {
		return (
			<>
				<TopNavbar highlightLink={categoryNameEnumVal} />
				<main className="flex flex-col items-center mb-16">
					<p>Error loading page, please return to home page.</p>
				</main>
			</>
		);
	}
}

export default page;
