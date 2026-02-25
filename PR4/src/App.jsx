import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}
function ProductCard({ product }) {
    return (
        <div className="product-card">
            <div className="image-wrapper">
                <img src={product.image} alt={product.title} />

                {/* Жанр поверх картинки */}
                <span className="genre-badge">
          {product.genre}
        </span>
            </div>

            <h3>{product.title}</h3>
            <p className="price">{product.price} ₽</p>

            {/* Количество товара */}
            <p className="quantity">
                В наличии: {product.quantity}
            </p>
        </div>
    )
}
export default App
