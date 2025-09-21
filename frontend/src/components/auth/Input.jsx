// className='w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border 
//                 border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500
//                  text-white placeholder-gray-400 transition duration-200'

const Input = ({icon: Icon, ...props}) => {
  return (
    <div className="relative flex flex-col">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-sky-600"/>
        <input
            {...props}
            className='border-2 border-slate-700 p-2 pl-10 rounded-lg shadow-md w-full
            focus:border-sky-700 focus:shadow-sky-500
              focus:outline-none hover:shadow-sky-500'
            required
        />
    </div>
  )
}

export default Input