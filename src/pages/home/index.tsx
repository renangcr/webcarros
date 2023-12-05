import { useState, useEffect, FormEvent } from 'react';
import {
  collection,
  query,
  getDocs,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../../services/firebaseConnection';

import Container from "../../components/container";
import { Link } from 'react-router-dom';

export interface CarsProps {
  id: string;
  name: string;
  year: string;
  uidOwner: string;
  price: string | number;
  city: string;
  km: string;
  images: CarImagesProps[];
}

interface CarImagesProps {
  name: string;
  uid: string;
  url: string;
}

export const Home = () => {
  const [cars, setCars] = useState<CarsProps[]>([]);
  const [loadImages, setLoadImages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {

    loadCars();

  }, []);

  function loadCars() {
    const carsRef = collection(db, "cars");
    const queryRef = query(carsRef, orderBy("created", "desc"))

    getDocs(queryRef).then((snapshot) => {
      let listCars = [] as CarsProps[];

      snapshot.forEach(doc => {
        const { name, year, km, city, uidOwner, price, images } = doc.data();

        listCars.push({
          id: doc.id,
          name, year, km, city, uidOwner, price, images
        })
      });

      setCars(listCars);
    });
  }

  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id]);
  }

  async function handleSearchCar(e: FormEvent) {
    e.preventDefault();
    if (input.trim() === '') {
      loadCars();
      return;
    }

    setCars([]);
    setLoadImages([]);

    const q = query(collection(db, "cars"), where("name", ">=", input.toUpperCase()), where("name", "<=", input.toUpperCase() + "\uf8ff"));

    const querySnapshot = await getDocs(q);

    let listCars = [] as CarsProps[];

    querySnapshot.forEach(doc => {
      const { name, year, km, city, uidOwner, price, images } = doc.data();

      listCars.push({
        id: doc.id,
        name, year, km, city, uidOwner, price, images
      })
    });

    setCars(listCars);
  }

  return (
    <Container>
      <section className="bg-white p-4 rounded w-full max-w-3xl mx-auto">
        <form
          className='w-full flex gap-2'
          onSubmit={handleSearchCar}
        >
          <input
            className="w-full border-2 rounded h-9 px-3 outline-none"
            placeholder="Digite o nome do carro..."
            value={input}
            id='inputSearch'
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="bg-red-500 h-9 px-8 rounded text-white font-medium text-xs"
            type='submit'
          >
            Buscar
          </button>
        </form>
      </section>

      <h1 className="font-bold text-center mt-6 text-2xl mb-4">Carros novos e usados em todo o Brasil</h1>

      <main className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {
          cars.map(item => (
            <Link to={`/car/${item.id}`} key={item.id}>
              <section className="w-full bg-white rounded">
                <div
                  className='w-full h-72  rounded bg-slate-200'
                  style={{ display: loadImages.includes(item.id) ? "none" : "block" }}
                ></div>
                <img
                  className="w-full rounded h-72 min-w-full mb-2 hover:scale-105 transition-all object-cover"
                  src={item.images[0].url}
                  alt="Imagem do carro"
                  onLoad={() => handleImageLoad(item.id)}
                  style={{ display: loadImages.includes(item.id) ? "block" : "none" }}
                />
                <p className="font-bold mt-1 mb-2 px-2 text-center">{item.name}</p>

                <div className="flex flex-col px-2 text-center">
                  <span className="text-zinc-700 mb-6">Ano {item.year} | {item.km} km</span>
                  <strong className="text-black font-medium text-xl">R$ {item.price}</strong>
                </div>

                <hr className="my-2" />

                <div className="px-2 pb-2">
                  <span className="text-zinc-700">
                    {item.city}
                  </span>
                </div>
              </section>
            </Link>
          ))
        }

      </main>
    </Container>
  )
}