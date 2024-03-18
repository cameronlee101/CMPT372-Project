const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const { helpers } = require("./models/db");

const port = 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/insertTestData", async (req, res) => {//testing
  try {
    helpers.insertTestData();
    console.log("Success: Data inserted succesfully!");
    res.status(201).send("Success: Data inserted succesfully!");
  } catch (error) {
    console.error("Error: Data Not Inserted.", error);
    res.status(500).send("Error: Data Not Inserted.");
  }
});
app.post("/deleteTestData", async (req, res) => {//testing
    try {
      helpers.deleteTestData();
      console.log("Success: Data deleted succesfully!");
      res.status(201).send("Success: Data deleted succesfully!");
    } catch (error) {
      console.error("Error: Data Not deleted.", error);
      res.status(500).send("Error: Data Not deleted.");
    }
  });
app.post("/deleteAllTables", async (req, res) => {//testing
    try {
      helpers.deleteAllTables();
      console.log("Success: Tables deleted succesfully!");
      res.status(201).send("Success: Tables deleted succesfully!");
    } catch (error) {
      console.error("Error: Tables Not deleted.", error);
      res.status(500).send("Error: Tables Not deleted.");
    }
  });
app.get("/getProduct", async (req, res) => {
  let product_id = req.body.product_id
    ? parseInt(req.body.product_id)
    : res.status(400).send({ error: "Invalid product id!" });
  let reply = [];
  try {
    // Check for non-positive product_id
    if (product_id <= 0) {
      res.status(400).send({ error: "Invalid Product ID!" });
    }
    const response = await helpers.getProductInfoByPid(product_id);
    if (response.length === 0) {
      res.status(404).send({ error: "Product not found!" });
    } else {
      res.status(200).json(response);
    }
  } catch (error) {
    res.status(500).send({ error: "Server failed to get product!" });
  }
});
app.get("/getProductsByFilters", async (req, res) => {
  const product_name = req.query.product_name
    ? req.query.product_name.trim()
    : "";
  const product_avg_rating_min =
    req.query.product_avg_rating_min !== undefined &&
    req.query.product_avg_rating_min !== ""
      ? parseInt(req.query.product_avg_rating_min)
      : 0.0;
  const product_avg_rating_max =
    req.query.product_avg_rating_max !== undefined &&
    req.query.product_avg_rating_max !== ""
      ? parseInt(req.query.product_avg_rating_max)
      : 5.0;
  const current_price_min =
    req.query.current_price_min !== undefined &&
    req.query.current_price_min !== ""
      ? parseInt(req.query.current_price_min)
      : 0.0;
  const current_price_max =
    req.query.current_price_max !== undefined &&
    req.query.current_price_max !== ""
      ? parseInt(req.query.current_price_max)
      : 2147483647; // SQL MAX INT
  const product_date_added_before =
    req.query.product_date_added_before !== undefined &&
    req.query.product_date_added_before !== ""
      ? parseInt(req.query.product_date_added_before)
      : new Date().getTime();
  const product_date_added_after =
    req.query.product_date_added_after !== undefined &&
    req.query.product_date_added_after !== ""
      ? parseInt(req.query.product_date_added_after)
      : 0;
  const tags = req.query.tags
    ? req.query.tags.trim().toLowerCase().split(",")
    : [];
  const user_email = req.query.user_email ? req.query.user_email.trim() : "";

  let responseIds = [];
  try {
    let response = await helpers.getProductIdByName(product_name);
    response.forEach((row) => {
      responseIds.push(row.product_id);
    });

    response = await helpers.getProductIdByRating(
      product_avg_rating_min,
      product_avg_rating_max,
    );
    let tempRows = response.map((row) => row.product_id);
    responseIds = responseIds.filter((id) => tempRows.includes(id));

    response = await helpers.getProductIdByPrice(
      current_price_min,
      current_price_max,
    );
    tempRows = response.map((row) => row.product_id);
    responseIds = responseIds.filter((id) => tempRows.includes(id));

    response = await helpers.getProductIdByDateAdded(
      product_date_added_after,
      product_date_added_before,
    );
    tempRows = response.map((row) => row.product_id);
    responseIds = responseIds.filter((id) => tempRows.includes(id));

    response = await helpers.getProductIdByUserEmail(user_email);
    tempRows = response.map((row) => row.product_id);
    responseIds = responseIds.filter((id) => tempRows.includes(id));

    if (tags.length > 0) {
      response = await helpers.getProductIdByTags(tags);
      tempRows = response.map((row) => row.product_id);
      responseIds = responseIds.filter((id) => tempRows.includes(id));
    }

    let reply = [];
    for (id of responseIds) {
      response = await helpers.getProductInfoByPid(id);
      response.forEach((row) => {
        reply.push({
          product_id: row.product_id,
          product_name: row.product_name,
          product_imgsrc: row.product_imgsrc,
          product_description: row.product_description,
          product_date_added: row.product_date_added,
          product_avg_rating: row.product_avg_rating,
          user_email: row.user_email,
          base_price: row.base_price,
          current_price: row.current_price,
        });
      });
    }

    res.status(200).send(reply);
  } catch (error) {
    res.status(500).send({ error: "Server failed to get products!" });
  }
});
app.get("/getUserTypeByUserEmail", async (req, res) => {
  let user_email = req.body.user_email;
  user_email
    ? user_email.trim()
    : res.status(400).send({ error: "Invalid user email!" });
  try {
    const users = await helpers.getUserTypeByUserEmail(user_email);
    if (users.length > 0) {
      res.status(200).json({ type: users[0].type });
    } else {
      res.status(404).send({ error: "User not found!" });
    }
  } catch (error) {
    res.status(500).send({ error: "Server failed to get user!" });
  }
});
app.get("/getUserCartByUserEmail", async (req, res) => {
  let user_email = req.body.user_email;
  user_email = user_email
    ? user_email.trim()
    : res.status(400).send({ error: "Invalid user email!" });
  try {
    const products = await helpers.getUserCartByUserEmail(user_email);
    if (products.length > 0) {
      res.json(products);
    } else {
      res.status(404).json({ error: "User cart not found!" });
    }
  } catch (error) {
    res.status(500).send({ error: "Server failed to get user cart!" });
  }
});
app.get("/getUserWishlistByUserEmail", async (req, res) => {
  let user_email = req.body.user_email;
  user_email
    ? user_email.trim()
    : res.status(400).send({ error: "Invalid user email!" });
  try {
    const products = await helpers.getUserWishlistByUserEmail(user_email);
    if (products.length > 0) {
      res.json(products);
    } else {
      res.status(404).send({ error: "User wishlist not found!" });
    }
  } catch (error) {
    res.status(500).send({ error: "Server failed to get user wishlist!" });
  }
});
app.get("/getProductsOnSaleByLimit", async (req, res) => {
  const limit = req.body.limit ? parseInt(req.body.limit) : -1; //-1 is unlimited
  try {
    const products = await helpers.getProductsOnSaleByLimit(limit);
    if (products.length > 0) {
      res.json(products);
    } else {
      res.status(404).json({ error: "Products not found!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server failed to get products!" });
  }
});
app.get("/getNewestProductsByLimit", async (req, res) => {
  const limit = req.body.limit ? parseInt(req.body.limit) : -1; //-1 is unlimited
  try {
    const products = await helpers.getNewestProductsByLimit(limit);
    if (products.length > 0) {
      res.json(products);
    } else {
      res.status(404).json({ error: "Products not found!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server failed to get products!" });
  }
});
app.post("/postUser", async (req, res) => {
  let { street_name, city, province, post_code, country, user_email, type } =
    req.body;
    street_name = street_name ? street_name.trim() : res.status(400).send({ error: "Street name required!" });
    city = city ? city.trim() : res.status(400).send({ error: "City required!" });
    province = province ? province.trim() : res.status(400).send({ error: "Province required!" });
    post_code = post_code ? post_code.trim() : res.status(400).send({ error: "Post code required!" });
    country = country ? country.trim() : res.status(400).send({ error: "Country required!" });
    user_email = user_email ? user_email.trim() : res.status(400).send({ error: "Invalid user email!" });
    type = type ? type.toLowerCase().trim() : res.status(400).send({ error: "Invalid type1!" });
  if (type !== "customer" && type !== "vendor") {
    res.status(400).send({ error: "Invalid type2!" });
  }
  let type_id = type === "vendor" ? 1 : 2;
  try {
    await helpers.postUser(
      street_name,
      city,
      province,
      post_code,
      country,
      user_email,
      type_id,
    );
    res.status(201).json({ success: "Product added successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server failed to add user!" });
  }
});
app.patch("/patchUserType", async (req, res) => {
  let { user_email, type } = req.body;
  user_email
    ? user_email.trim()
    : res.status(400).send({ error: "Invalid user email!" });
  type ? type.trim() : res.status(400).send({ error: "Invalid type!" });
  if (type !== "customer" && type !== "vendor") {
    res.status(400).send({ error: "Invalid type2!" });
  }
  let type_id = type === "vendor" ? 1 : 2;
  try {
    await helpers.patchUserType(user_email, type_id);
    res.status(200).json({ success: "User type modified successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server failed to modify user type!" });
  }
});
app.patch("/patchUserAddress", async (req, res) => {
  let { user_email, street_name, city, province, post_code, country } =
    req.body;
  user_email
    ? user_email.trim()
    : res.status(400).send({ error: "Invalid user email!" });
  street_name
    ? street_name.trim()
    : res.status(400).send({ error: "Invalid street name!" });
  city ? city.trim() : res.status(400).send({ error: "Invalid city!" });
  province
    ? province.trim()
    : res.status(400).send({ error: "Invalid province!" });
  post_code
    ? post_code.trim()
    : res.status(400).send({ error: "Invalid post code!" });
  country
    ? country.trim()
    : res.status(400).send({ error: "Invalid country!" });
  try {
    await helpers.patchUserAddress(
      user_email,
      street_name,
      city,
      province,
      post_code,
      country,
    );
    res.status(200).send({ success: "User address modified successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Server failed to modify user address!" });
  }
});
app.delete("/deleteUserCartByPidUserEmail", async (req, res) => {
  let { user_email, product_id } = req.body;
  user_email
    ? user_email.trim()
    : res.status(400).send({ error: "Invalid user email!" });
  product_id = parseInt(product_id);
  try {
    await helpers.deleteUserCartByPidUserEmail(user_email, product_id);
    res
      .status(200)
      .send({ success: "Item removed from user cart successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .send({ error: "Server failed to delete prodcut from user cart!" });
  }
});
app.delete("/deleteUserWishlistByPidUserEmail", async (req, res) => {
  let { user_email, product_id } = req.body;
  user_email
    ? user_email.trim()
    : res.status(400).send({ error: "Invalid user email!" });
  product_id = parseInt(product_id);
  try {
    await helpers.deleteUserWishlistByPidUserEmail(user_email, product_id);
    res
      .status(200)
      .send({ success: "Item removed from user wishlist successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .send({ error: "Server failed to delete product from user wishlist!" });
  }
});
app.post("/postProductToUserCart", async (req, res) => {
    //TODO: missing the fucntionality where if a product already exists in a cart, then just add up the quantity
  let { user_email, product_id, quantity } = req.body;
  user_email
    ? user_email.trim()
    : res.status(400).send({ error: "Invalid user email!" });
  product_id = parseInt(product_id);
  quantity = parseInt(quantity);
  try {
    await helpers.postProductToUserCart(user_email, product_id, quantity);
    res.status(200).send({ success: "Item added to user cart successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .send({ error: "Server failed to add product to the user cart!" });
  }
});
app.post("/postProductToUserWishlist", async (req, res) => {
  //TODO: missing the fucntionality where if a product already exists in a wishlist, then just add up the quantity
  let { user_email, product_id, quantity } = req.body;
  user_email
    ? user_email.trim()
    : res.status(400).send({ error: "Invalid user email!" });
  product_id = parseInt(product_id);
  quantity = parseInt(quantity);
  try {
    await helpers.postProductToUserWishlist(user_email, product_id, quantity);
    res
      .status(200)
      .send({ success: "Item added to user wishlist successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .send({ error: "Server failed to add product to the user wishlist!" });
  }
});
app.patch("/patchWarehouseStock", async (req, res) => {
  //TODO: we need to first see if the product_id and warehouse_id combo exists, if yes then swap the quantities. if not then create and then add.
  let { warehouse_id, product_id, quantity } = req.body;
  warehouse_id = warehouse_id
    ? parseInt(warehouse_id)
    : res.status(400).send({ error: "Invalid warehouse id!" });
  product_id = product_id
    ? parseInt(product_id)
    : res.status(400).send({ error: "Invalid warehouse id!" });
  quantity = quantity
    ? parseInt(quantity)
    : res.status(400).send({ error: "Invalid warehouse id!" });
  try {
    const response = await helpers.patchWarehouseStock(
      warehouse_id,
      product_id,
      quantity,
    );
    if (response === 1) {
      res
        .status(200)
        .send({ success: "Warehouse quantity modified successfully!" });
    }
    res
      .status(400)
      .json({ error: "Warehouse quantity is less than desired quantity!" });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Server failed to modify warehouse quantity!" });
  }
});

try {
  helpers.init().then(() => {
    console.log("Success: Tables created succesfully!");
    app.listen(port, "0.0.0.0");
    console.log(`Running on http://0.0.0.0:${port}`);
  });
} catch (error) {
  console.error("Error: Failed to create tables.", error);
}
