import { ChangeEvent, useContext, useState } from "react";
import Container from "../../../components/container";
import { DashboardHeader } from "../../../components/panelHeader";
import { FiTrash, FiUpload } from "react-icons/fi";

import { useForm } from 'react-hook-form';
import { Input } from "../../../components/input";
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "../../../contexts/AuthContext";
import { v4 as uuidV4 } from 'uuid';

import { db, storage } from "../../../services/firebaseConnection";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { addDoc, collection } from "firebase/firestore";

import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(1, "Campo nome é obrigatório"),
  model: z.string().min(1, "Campo modelo é obrigatório"),
  year: z.string().min(1, "Campo ano é obrigatório"),
  km: z.string().min(1, "Campo KM do carro é obrigatório"),
  price: z.string().min(1, "Campo preço é obrigatório"),
  city: z.string().min(1, "Campo cidade é obrigatório"),
  whatsapp: z.string().min(1, "Campo whatsapp é obrigatório").refine((value) => /^(\d{11,12})$/.test(value), {
    message: "Número de whatsapp inválido"
  }),
  description: z.string().min(1, "Campo descrição é obrigatório")
});

type FormData = z.infer<typeof schema>;

interface ImageItemProps {
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}

export const New = () => {
  const { user } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  });

  const [carImages, setCarImages] = useState<ImageItemProps[]>([]);

  function onSubmit(data: FormData) {
    if (carImages.length === 0) {
      toast.error("Envie alguma imagem");
      return;
    }

    const carListImages = carImages.map(car => {
      return {
        uid: car.uid,
        name: car.name,
        url: car.url
      }
    });

    const { name, model, year, km, whatsapp, city, price, description } = data;

    addDoc(collection(db, "cars"), {
      name: name.toUpperCase(), model, year, km, whatsapp, city, price, description,
      created: new Date(),
      owner: user?.name,
      uidOwner: user?.uid,
      images: carListImages
    }).then(() => {
      reset();
      setCarImages([]);
      toast.success("Carro adicionado com sucesso!", {
        style: {
          padding:25
        }
      })
    }).catch(() => {
      toast.error('Erro ao cadastrar no banco')
    })
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0];

      if (image.type === 'image/jpeg' || image.type === 'image/png') {
        await handleUpload(image)
      } else {
        toast.error("Tipo inválido");
      }
    }
  }

  async function handleUpload(image: File) {
    if (!user?.uid) {
      return;
    }

    const currentUid = user?.uid;
    const uidImage = uuidV4();

    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`);

    uploadBytes(uploadRef, image)
      .then((snapshot) => {
        getDownloadURL(snapshot.ref).then(downloadUrl => {
          const imageItem = {
            name: uidImage,
            uid: currentUid,
            previewUrl: URL.createObjectURL(image),
            url: downloadUrl
          }

          setCarImages((images) => [...images, imageItem])
        })
      }).catch((_) => toast.error('Erro ao enviar imagem'))
  }

  async function handleDeleteImage(item: ImageItemProps) {
    const imagePath = `images/${item.uid}/${item.name}`;

    const imageRef = ref(storage, imagePath);

    try {
      await deleteObject(imageRef);
      setCarImages(carImages.filter(imgCar => imgCar.url !== item.url))
    } catch (_) {
      toast.error("Erro ao deletar imagem")
    }
  }

  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-white p-3 rounded flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>

          <div className="cursor-pointer">
            <input type="file" accept="image/*" className="opacity-0 cursor-pointer" onChange={handleFile} />
          </div>
        </button>

        {carImages.map(item => (
          <div key={item.name} className="w-full h-32 flex items-center justify-center relative">
            <button className="absolute" onClick={() => handleDeleteImage(item)}>
              <FiTrash size={28} color="#FFF" />
            </button>
            <img src={item.previewUrl} className="rounded w-full h-32 object-cover" alt="Foto do carro" />
          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form
          className='w-full' onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-3'>
            <p className="mb-2 font-medium">Nome</p>
            <Input
              type="text"
              placeholder="Ex: Onix 1.0"
              name="name"
              error={errors.name?.message}
              register={register}
            />
          </div>

          <div className='mb-3'>
            <p className="mb-2 font-medium">Modelo</p>
            <Input
              type="text"
              placeholder="Ex: 1.0 Flex Plus Manual..."
              name="model"
              error={errors.model?.message}
              register={register}
            />
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano</p>
              <Input
                type="text"
                placeholder="Ex: 2016/2017"
                name="year"
                error={errors.year?.message}
                register={register}
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">KM rodado</p>
              <Input
                type="text"
                placeholder="Ex: 23.900"
                name="km"
                error={errors.km?.message}
                register={register}
              />
            </div>
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone / Whatsapp</p>
              <Input
                type="text"
                placeholder="Ex: 011987654321"
                name="whatsapp"
                error={errors.whatsapp?.message}
                register={register}
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input
                type="text"
                placeholder="Ex: São Paulo - SP"
                name="city"
                error={errors.city?.message}
                register={register}
              />
            </div>
          </div>

          <div className='mb-3'>
            <p className="mb-2 font-medium">Preço</p>
            <Input
              type="text"
              placeholder="Ex: 69.000"
              name="price"
              error={errors.price?.message}
              register={register}
            />
          </div>

          <div className='mb-3'>
            <p className="mb-2 font-medium">Descrição</p>
            <textarea
              className="border-2 w-full rounded h-24 px-2"
              {...register("description")}
              name="description"
              placeholder="Digite a descrição completa sobre o carro..."
            />
            {errors.description && <p>{errors.description.message}</p>}
          </div>

          <button
            type="submit"
            className='bg-zinc-900 w-full rounded text-white h-10 font-medium'>
            Cadastrar
          </button>
        </form>
      </div>
    </Container>
  )
}