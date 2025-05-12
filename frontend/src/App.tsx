import { useState } from 'react'
import { read, utils } from 'xlsx';
import AxiosInstance from './Api/AxiosInstance';


function App() {
  const [emails, setEmails] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileData = e.target.files?.[0];
    if (fileData) {
      setFileName(fileData.name);
    }
    console.log("fileData", fileData)
    debugger
    const reader = new FileReader();

    reader.onload = (e) => {

      const binaryStr = e.target.result;
      const workbook = read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const workSheet = workbook.Sheets[sheetName];
      const data = utils.sheet_to_json(workSheet, { header: 1 }) as string[][];


      const emailList = data.slice(1).map((row) => row[0]).filter((email): email is string => typeof email === 'string');

      setEmails(emailList);
      console.log("workbook", emailList,)
    }
    reader.readAsBinaryString(fileData);
  };

  const handleMsg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setMsg(inputValue)
  }

  const handleSend = async () => {
    try {
      setStatus(true)
      const response = await AxiosInstance.post('sendEmail', { msg: msg ,emailList:emails})
      if (response.data) {
        alert("Mail sended successfully");
        setStatus(false);
      } else {
        alert("Mail sended Failed");
        setStatus(false);
      }
    } catch (e) {

    }
  };

  return (
    <div>
      <div className='bg-blue-950 text-white text-center py-10'>
        <h1 className='text-2xl font-medium px-5 py-3 '> Bulk Mail Application</h1>
      </div>

      <div className='bg-blue-800 text-white text-center py-10'>
        <h1 className=' font-medium px-5 py-3 '> We can help business with sending multiple emails at once</h1>
      </div>

      <div className='bg-blue-600 text-white text-center py-5'>
        <h1 className=' font-medium px-5 py-3 '> Drag and Drop</h1>
      </div>

      <div className='bg-blue-400  flex flex-col items-center text-black px-5 py-13'>
        <textarea onChange={handleMsg} placeholder='Enter the email text ...' className='w-[80%] bg-white h-32 py-2  outline-none px-2 border border-black rounded-b-md'></textarea>

        <div className="">
          <label
            htmlFor="file-upload"
            className="mt-5 mb-5 block border-4 text-white hover:text-black border-dashed border-white rounded-lg py-4 px-4 text-center cursor-pointer hover:bg-gray-50 transition">
            <span className=" font-medium "> {fileName ? `Selected: ${fileName}` : 'Click to choose a file'}</span>
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <p>Total Emails in the file : {emails.length}</p>

        <button onClick={handleSend} className='bg-blue-950 py-2 mt-2 px-4 text-white font-medium rounded-md w-fit'>{status ? "Sending" : "Send"}</button>
      </div>
      <div className='bg-blue-300 text-white text-center p-12'>
      </div>
      <div className='bg-blue-200 text-white text-center p-12'>
      </div>

    </div>
  )
}

export default App
