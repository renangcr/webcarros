import { useEffect, useState, useContext } from "react";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import Container from "../../components/container"
import { DashboardHeader } from "../../components/panelHeader"

import { FiTrash2 } from "react-icons/fi"
import { db, storage } from "../../services/firebaseConnection";
import { CarsProps } from "../home";
import { AuthContext } from "../../contexts/AuthContext";

import { ref, deleteObject } from 'firebase/storage';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [cars, setCars] = useState<CarsProps[]>([]);
  const [loadImages, setLoadImages] = useState<string[]>([]);

  useEffect(() => {

    function loadCars() {
      if (!user?.uid) {
        return;
      }

      const carsRef = collection(db, "cars");
      const queryRef = query(carsRef, where("uidOwner", "==", user.uid))

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
      })
    }

    loadCars();

  }, [user]);

  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id]);
  }

  async function handleDeleteCar(car: CarsProps) {
    const docRef = doc(db, "cars", car.id);
    await deleteDoc(docRef);

    car.images.map(async (image) => {
      const imagePath = `images/${image.uid}/${image.name}`;
      const imageRef = ref(storage, imagePath);

      try {
        await deleteObject(imageRef)
        setCars(cars.filter(item => item.id !== car.id));
        toast.success("Removido com sucesso!");
      } catch (error) {
        console.log("Erro ao excluir imagens")
      }
    })
  }

  return (
    <Container>
      <DashboardHeader />

      <main className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {
          cars.map(item => (
            <section className="w-full bg-white rounded relative" key={item.id}>
              <div
                className='w-full h-72  rounded bg-slate-200'
                style={{ display: loadImages.includes(item.id) ? "none" : "block" }}
              ></div>
              <button onClick={() => handleDeleteCar(item)} className="absolute bg-white w-14 h-14 rounded flex items-center justify-center right-2 top-2 drop-shadow">
                <FiTrash2 size={26} color="#000" />
              </button>
              <img
                className="w-full rounded h-72 min-w-full mb-2 object-cover"
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

          ))
        }

      </main>
    </Container>
  )
}