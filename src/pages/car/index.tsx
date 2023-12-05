import { useState, useEffect } from 'react'
import Container from "../../components/container"
import { FaWhatsapp } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { CarsProps } from '../home';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConnection';

import { Swiper, SwiperSlide } from 'swiper/react';

interface CarDetailProps extends CarsProps {
  description: string;
  model: string;
  created: string;
  owner: string;
  whatsapp: string;
}

export const CarDetail = () => {
  const navigate = useNavigate();

  const [car, setCar] = useState<CarDetailProps>();
  const { id } = useParams();
  const [slidePerView, setSlidePerView] = useState<number>(1);

  useEffect(() => {
    async function loadCar() {
      if (!id) {
        return
      }

      const docRef = doc(db, "cars", id);
      await getDoc(docRef).then((snapshot) => {
        if (!snapshot.data()) {
          navigate("/");
        }
        const { name, year, km, city, uidOwner, price, images, description, model, created, owner, whatsapp } = snapshot.data() as CarDetailProps;
        setCar({
          id: snapshot.id,
          name, year, km, city, uidOwner, price, images, description, model, created, owner, whatsapp
        })

      })
    }

    loadCar();
  }, [id]);

  useEffect(() => {

    function handleResize() {
      if (window.innerWidth < 720) {
        setSlidePerView(1);
      } else {
        setSlidePerView(2);
      }
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, [])

  return (
    <Container>
      {
        car && (
          <Swiper
            slidesPerView={slidePerView}
            pagination={{ clickable: true }}
            navigation
          >
            {
              car?.images.map(image => (
                <SwiperSlide key={image.name}>
                  <img src={image.url} className='w-full h-96 object-cover' />
                </SwiperSlide>
              ))
            }
          </Swiper>
        )
      }
      {
        car && (
          <main className='w-full bg-white rounded p-6 my-4'>
            <div className='flex flex-col sm:flex-row mb-4 items-center justify-between'>
              <h1 className='font-bol text-3xl text-black'>{car?.name}</h1>
              <h1 className='font-bol text-3xl text-black'>R$ {car?.price}</h1>
            </div>
            <p>{car?.model}</p>

            <div className='flex w-full gap-6 my-4'>
              <div className='flex flex-col gap-4'>
                <div>
                  <p>Cidade</p>
                  <strong>{car?.city}</strong>
                </div>
                <div>
                  <p>Ano</p>
                  <strong>{car?.year}</strong>
                </div>
              </div>

              <div className='flex flex-col gap-4'>
                <div>
                  <p>KM</p>
                  <strong>{car?.km}</strong>
                </div>
              </div>
            </div>

            <strong>Descrição:</strong>
            <p className='mb-4'>{car?.description}</p>

            <strong>Telefone / WhatsApp</strong>
            <p>{car?.whatsapp}</p>

            <a
              href={`https://api.whatsapp.com/send?phone=55${car?.whatsapp}&text=Olá vi esse ${car?.name} no site webcarros e fiquei interessado`}
              target='_blank'
              className='bg-green-500 w-full text-white flex items-center justify-center gap-2 my-6 h-12 text-xl rounded cursor-pointer'
            >
              Conversar com vendedor
              <FaWhatsapp size={26} color="#FFF" />
            </a>
          </main>
        )
      }
    </Container>
  )
}