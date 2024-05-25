// app.js
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const xml2js = require("xml2js");
const axios = require("axios");
const router = express.Router();
const cron = require("node-cron");
const url = "https://eusfusmfnsoyxybzmhap.supabase.co";
const key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1c2Z1c21mbnNveXh5YnptaGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1MjM2MTAsImV4cCI6MjAzMDA5OTYxMH0.KVX6gl6ifLwBkkpzRcawpqNJH26oN_D-GakMKHT_onw";

const supabase = createClient(url, key);

router.post("/getOrder", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
id, 
code, 
products_combo ( id, title, imageUrl, products ( id, title, amount, variant_name, unit_price ))
`
      )
      .eq("code", req.body.code);

    if (error || data.length == 0) {
      return res
        .status(400)
        .json({ message: error.message || "Data not found" });
    }

    res.send(data[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/postOrder", async (req, res) => {
  try {
    const order = req.body.dto;

    if (
      !containsOnlyNumbers(order.OrderNumber) ||
      order.OrderNumber.length != 7
    )
      return res.status(400).json({ message: "Spatny code" });

    const { data: orderDataExist, error: orderErrorExist } = await supabase
      .from("orders")
      .select()
      .eq("code", order.OrderNumber);

    if (orderDataExist.length != 0) {
      return res.status(400).json({ message: "Order already exist" });
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({ code: order.OrderNumber })
      .select();

    if (orderError) {
      throw new Error("Error inserting order: " + orderError.message);
    }
    await Promise.all(
      order.ItemSets.map(async (item) => {
        const { data: productComboData, error: comboError } = await supabase
          .from("products_combo")
          .insert({
            title: item.Title,
            imageUrl: item.ImgUrl,
            order_id: orderData[0].id,
          })
          .select();

        if (comboError) {
          throw new Error(
            "Error inserting product combo: " + comboError.message
          );
        }

        const productPromises = item.Products.map(async (i) => {
          const { data: productData, error: productError } = await supabase
            .from("products")
            .insert({
              amount: i.Amount,
              title: i.Title,
              variant_name: i.VariantTitle,
              unit_price: i.UnitPrice,
              products_combo_id: productComboData[0].id,
            })
            .select();

          if (productError) {
            throw new Error("Error inserting product: " + productError.message);
          }

          return { productData, productError };
        });

        return Promise.all(productPromises);
      })
    );

    res.status(200).json({ message: "ok" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const CronFunction = async () => {
  const feedUrl = "https://www.extrifit.cz/export-orders-fd96h3CGXn.xml";
  try {
    const response = await axios.get(feedUrl);

    // Parse XML to JavaScript object
    xml2js.parseString(response.data, async (err, result) => {
      if (err) {
        console.error("Error parsing XML:", err);
        return;
      }

      // Process the parsed XML object
      const orders = result.ORDERS.ORDER;
      for (const order of orders) {
        if (order.HEADER[0].STATUS[0] !== "Vyřízeno") {
          continue; // Skip the rest of the current iteration if status is not "Vyřízeno"
        }

        try {
          const { data, error } = await supabase
            .from("orders")
            .delete()
            .eq("code", order.HEADER[0].CODE[0]);

          if (error) {
            console.error("Error deleting order:", error);
          } else {
            console.log(
              `Order ${order.HEADER[0].CODE[0]} deleted successfully`
            );
          }
        } catch (error) {
          console.error("Error interacting with Supabase:", error);
        }
      }
    });
  } catch (error) {
    console.error("Error fetching XML feed:", error);
  }
};

cron.schedule("0 4 * * *", () => {
  CronFunction();
});

function containsOnlyNumbers(str) {
  return /^\d+$/.test(str);
}

module.exports = router;
