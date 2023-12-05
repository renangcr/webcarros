import { RegisterOptions, UseFormRegister } from "react-hook-form";


interface InputProps {
    type: string;
    placeholder: string;
    name: string;
    register: UseFormRegister<any>;
    error?: string;
    rules?: RegisterOptions
}

export const Input = ({ type, placeholder, name, register, rules, error }: InputProps) => {
    return (
        <div>
            <input
                className="w-full border-2 rounded h-11 px-2"
                type={type}
                placeholder={placeholder}
                {...register(name, rules)}
                id={name}
            />
            { error && <p className="text-red-500 my-1 px-1">{error}</p>}
        </div>
    )
}