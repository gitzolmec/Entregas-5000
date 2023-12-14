const { Router } = require("express");
const router = Router();
const ProductManager = require("../services/ProductsManager");
let productManager;

const errorHandler = (err, res) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
};

(async () => {
  productManager = await new ProductManager("controllers/products.json");
  router.get("/", async (req, res) => {
    // Obtener todos los productos
    try {
      await productManager.loadProducts();

      const limit = req.query.limit;
      console.log("Cargando productos");
      // Espera a que los productos se carguen

      const products = limit
        ? productManager.getProducts().slice(0, limit)
        : productManager.getProducts();
      res.json({ products });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.get("/:pid", async (req, res) => {
    // Obtener un producto por su ID
    try {
      const pid = parseInt(req.params.pid);
      await productManager.loadProducts();
      const product = productManager.getProductById(pid);
      if (product) {
        res.json({ product });
      } else {
        res.status(404).json({ error: "Producto no encontrado" });
      }
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.post("/", async (req, res) => {
    // Agregar un nuevo producto
    try {
      const { title, description, price, thumbnail, code, stock, status } =
        req.body;
      if (
        !title ||
        !description ||
        !price ||
        !thumbnail ||
        !code ||
        !stock ||
        !status
      ) {
        throw new Error("Todos los campos son obligatorios");
      }

      await productManager.addProduct(
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        status
      );
      res.json({ message: "Producto agregado con éxito" });
    } catch (err) {
      console.error("Error:", err);
      errorHandler(err, res);
    }
  });

  router.put("/:pid", async (req, res) => {
    // Actualizar un producto por su ID
    try {
      const pid = parseInt(req.params.pid);
      const updatedFields = req.body;
      await productManager.updateProduct(pid, updatedFields);
      res.json({ message: `Producto con ID ${pid} actualizado con éxito` });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.delete("/:pid", async (req, res) => {
    try {
      const pid = parseInt(req.params.pid);

      await productManager.loadProducts();

      const deleted = (await productManager.deleteProduct(pid)) ? true : false;

      if (!deleted) {
        console.log(deleted);
        return res.status(404).json({
          message: "Producto no encontrado",
        });
      }

      res.json({
        message: `Producto con ID ${pid} eliminado con éxito`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error al eliminar producto",
      });
    }
  });
})();
module.exports = router;
