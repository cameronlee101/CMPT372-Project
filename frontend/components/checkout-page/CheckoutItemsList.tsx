import { Card, CardBody } from "@nextui-org/react";
import { ShoppingCartEntry } from "@/api/product.types";

type CheckoutItemsListProps = {
  data: undefined | ShoppingCartEntry[];
};

export function CheckoutItemsList({ data }: CheckoutItemsListProps) {
  return (
    <div className="mx-4">
      <h3 className="text-xl flex justify-center mb-2">Review Items:</h3>
      <div className="max-h-[80vh] overflow-y-auto px-2">
        {data?.map((item) => (
          <div className="h-fit w-full my-2" key={item.product_id}>
            <Card className="h-auto">
              <CardBody className="flex flex-row justify-between items-end">
                <div className="flex items-center">
                  <img
                    src={item.product_imgsrc}
                    alt={`${item.product_name} image`}
                    width={50}
                    height={50}
                  />
                  <div>
                    <p>{item.product_name}</p>
                    <p>Price: ${item.base_price.toFixed(2)}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}