"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

import API_BASE_URL from "../../config/api";
const API_URL = `${API_BASE_URL}/products`;

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    imgURL: "",
  });
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => {
    // Check authentication
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al obtener los productos");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url = isEditing ? `${API_URL}/${isEditing}` : API_URL;
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...formData,
        price: Number(formData.price),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Error al ${isEditing ? "actualizar" : "crear"} el producto. Es posible que no tengas permisos.`);
      }

      // Reset form and refresh list
      setFormData({ name: "", category: "", price: "", imgURL: "" });
      setIsEditing(null);
      fetchProducts();
      alert(`Producto ${isEditing ? "actualizado" : "creado"} con éxito`);
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
  };

  const handleEditClick = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      imgURL: product.imgURL || "",
    });
    setIsEditing(product.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "x-access-token": token,
        },
      });

      if (!res.ok) {
        let errorMessage = "Error al eliminar. Es posible que no tengas permisos (Se requiere Admin).";
        try {
          const data = await res.json();
          if (data && data.message) errorMessage = data.message;
        } catch(e) {}
        throw new Error(errorMessage);
      }

      // El backend devuelve 204 No Content, por lo que no hay JSON para parsear
      fetchProducts();
      alert("Producto eliminado correctamente");
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading && products.length === 0) {
    return <div className={styles.container}>Cargando inventario...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard - Inventario</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Cerrar Sesión
        </button>
      </header>

      {error && <div className="error-message" style={{marginBottom: "20px"}}>{error}</div>}

      <div className={styles.grid}>
        {/* Form Section */}
        <aside>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>
              {isEditing ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre del producto</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Ej. Laptop HP"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoría</label>
                <input
                  type="text"
                  name="category"
                  className="form-input"
                  placeholder="Ej. Electrónica"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Precio ($)</label>
                <input
                  type="number"
                  name="price"
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL de Imagen (Opcional)</label>
                <input
                  type="url"
                  name="imgURL"
                  className="form-input"
                  placeholder="https://..."
                  value={formData.imgURL}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn-primary">
                {isEditing ? "Guardar Cambios" : "Agregar Producto"}
              </button>
              
              {isEditing && (
                <button 
                  type="button" 
                  className={styles.btnCancel}
                  onClick={() => {
                    setIsEditing(null);
                    setFormData({ name: "", category: "", price: "", imgURL: "" });
                  }}
                >
                  Cancelar
                </button>
              )}
            </form>
          </div>
        </aside>

        {/* List Section */}
        <main className={styles.listPanel}>
          <h2 className={styles.listTitle}>Lista de Productos</h2>
          
          {products.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No hay productos en el inventario.</p>
              <p style={{fontSize: "14px", marginTop: "8px"}}>Agrega uno desde el panel izquierdo.</p>
            </div>
          ) : (
            <div className={styles.inventoryGrid}>
              {products.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.productImage}>
                    {product.imgURL ? (
                      <img src={product.imgURL} alt={product.name} />
                    ) : (
                      <span className={styles.productImagePlaceholder}>📦</span>
                    )}
                  </div>
                  <div className={styles.productContent}>
                    <div className={styles.productHeader}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <span className={styles.productPrice}>${product.price}</span>
                    </div>
                    <span className={styles.productCategory}>{product.category}</span>
                    
                    <div className={styles.productActions}>
                      <button 
                        onClick={() => handleEditClick(product)}
                        className={styles.btnEdit}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className={styles.btnDelete}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
