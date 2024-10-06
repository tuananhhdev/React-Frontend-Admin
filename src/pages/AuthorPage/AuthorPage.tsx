import styled from "styled-components";
import AddAuthorBtn from "../../components/AddAuthorBtn/AddAuthorBtn";
import {
  Button,
  Form,
  Input,
  Pagination,
  Popconfirm,
  Select,
  Space,
  Table,
} from "antd";
import FormItem from "antd/es/form/FormItem";
import { useQuery } from "@tanstack/react-query";
import { PropagateLoader } from "react-spinners";
import axios from "axios";
import AddAuthor from "../../components/AddAuthorBtn/AddAuthorBtn-copy";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";

interface Author {
  _id: string;
  photo: string;
  category_name: string;
  author_email: string;
  author_description: string;
}

const AuthorPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const page_str = params.get("page");
  const page = page_str ? page_str : 1;

  const category_str = params.get("category");
  const category_id = category_str ? category_str : null;
  const fetchAuthors = async () => {
    const limit = 10;
    let url = `http://localhost:8080/api/v1/authors`;
  
    // Nếu có category_id thì dùng dấu `&`, còn nếu không thì dùng dấu `?`
    if (category_id) {
      url += `?category=${category_id}&`;
    } else {
      url += `?`;
    }
    
    // Thêm page và limit vào URL
    url += `page=${page}&limit=${limit}`;
  
    const res = await axios.get(url);
    console.log(res.data); // Kiểm tra phản hồi API
    return res.data.data;
  };
  

  const getAuthor = useQuery({
    queryKey: ["authors", page, category_id],
    queryFn: fetchAuthors,
    onSuccess: (data) => {
      console.log("Fetched authors:", data); // Xem dữ liệu đã fetch thành công chưa
    },
    onError: (error) => {
      console.error("Error fetching authors:", error); // Nếu có lỗi, xem chi tiết
    },
  });

  console.log(getAuthor.data);
  // const { data, isLoading, isError, error } = useQuery<Author[], Error>({
  //   queryKey: ["authors"],
  //   queryFn: getAuthor,
  //   staleTime: 5000,
  // });

  const onFinish = () => {
    console.log("values ");
  };

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  const RalewayFont = styled.p`
    font-family: "Raleway", sans-serif;
  `;

  const column = [
    {
      title: "No",
      dataIndex: "no", // Có thể không có "no" trong dữ liệu
      key: "no",
    },
    {
      title: "Photo",
      dataIndex: "photo",
      key: "photo",
      render: (_, record) => {
        return <img src={record.photo} alt="author photo" />;
      },
    },
    {
      title: "Category Name",
      dataIndex: "category_name", // Đảm bảo rằng trường này tồn tại
      key: "category_name",
      render: (_, record) => {
        return <span>{record.category_name}</span>; // Đảm bảo dữ liệu có trường này
      },
    },
    {
      title: "Author E-mail",
      dataIndex: "author_email",
      key: "author_email",
      render: (_, record) => {
        return <span>{record.author_email}</span>; // Hiển thị email chính xác
      },
    },
    {
      title: "Author Description",
      dataIndex: "author_description",
      key: "author_description",
      render: (_, record) => {
        return <span>{record.author_description}</span>;
      },
    },
  ];
  

  return (
    // <div className="author">
    //   <div className="mx-[48px] my-[50px]">
    //     <div className="flex justify-between items-center">
    //       <RalewayFont className=" text-[16px] font-medium">
    //         Author Lists
    //       </RalewayFont>
    //       <AddAuthor />
    //     </div>
    //   </div>
    //   <hr className="border-t-2 border-[#C3C3C3] mx-[24px]" />
    //   <div className="mx-[48px] my-[24px]">
    //     <div className="flex justify-between">
    //       <div>
    //         <RalewayFont className="text-[16px]">
    //           Show
    //           <Select
    //             className="mx-2"
    //             defaultValue="10"
    //             style={{ width: 60 }}
    //             onChange={handleChange}
    //             options={[
    //               { value: 10, label: 10 },
    //               { value: 20, label: 20 },
    //               { value: 30, label: 30 },
    //               { value: 40, label: 40 },
    //               { value: 50, label: 50 },
    //             ]}
    //           />
    //           entries
    //         </RalewayFont>
    //       </div>
    //       <div className="flex gap-5">
    //         Search:
    //         <Form onFinish={onFinish} name="search" style={{ width: 200 }}>
    //           <FormItem rules={[{ required: true }]}>
    //             <Input className="hover:border-black hover:border-2 focus:border-black" />
    //           </FormItem>
    //         </Form>
    //       </div>
    //     </div>
    //     {/* Table */}
    //     <div>
    //       {isLoading ? (
    //         <PropagateLoader color="#f54272" className="mt-10 text-center" />
    //       ) : isError ? (
    //         <div className=" text-red-500">
    //           <p className="flex gap-3">
    //             <svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               fill="none"
    //               viewBox="0 0 24 24"
    //               strokeWidth={1.5}
    //               stroke="currentColor"
    //               className="size-6">
    //               <path
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
    //               />
    //             </svg>
    //             Error fetching data : {error.message}
    //           </p>
    //         </div>
    //       ) : (
    //         <div className="relative overflow-x-auto">
    //           <table className="w-full text-left rtl:text-right text-gray-500">
    //             <thead className=" text-white bg-black h-[67px] text-[16px] capitalize">
    //               <tr>
    //                 <th scope="col" className="px-6 py-3">
    //                   <RalewayFont className="font-medium">no</RalewayFont>
    //                 </th>
    //                 <th scope="col" className="px-6 py-3">
    //                   <RalewayFont className="font-medium">profile</RalewayFont>
    //                 </th>
    //                 <th scope="col" className="px-6 py-3">
    //                   <RalewayFont className="font-medium">
    //                     category name
    //                   </RalewayFont>
    //                 </th>
    //                 <th scope="col" className="spx-6 py-3">
    //                   <RalewayFont className="font-medium">
    //                     author email
    //                   </RalewayFont>
    //                 </th>
    //                 <th scope="col" className="px-6 py-3">
    //                   <RalewayFont className="font-medium">
    //                     author description
    //                   </RalewayFont>
    //                 </th>
    //                 <th scope="col" className="px-6 py-3">
    //                   <RalewayFont className="font-medium">action</RalewayFont>
    //                 </th>
    //               </tr>
    //             </thead>
    //             <tbody>
    //               {data?.map((author, index: number) => (
    //                 <tr
    //                   key={author._id}
    //                   className="bg-white border-b text-[#1A1A1A]">
    //                   <td className="px-6 py-4">
    //                     <RalewayFont>{index + 1}</RalewayFont>
    //                   </td>
    //                   <td className="px-6 py-4">
    //                     <img
    //                       className="w-[60px] h-[50px]"
    //                       src={author.photo}
    //                       alt=""
    //                     />
    //                   </td>
    //                   <td className="px-6 py-4">{author.category_name}</td>
    //                   <td className="px-6 py-4">{author.author_email}</td>
    //                   <td className="px-6 py-4">{author.author_description}</td>
    //                   <td className="px-6 py-4">
    //                     <div className="flex gap-3">
    //                       <div>
    //                         <button>
    //                           <svg
    //                             xmlns="http://www.w3.org/2000/svg"
    //                             fill="none"
    //                             viewBox="0 0 24 24"
    //                             strokeWidth={1.5}
    //                             stroke="currentColor"
    //                             className="size-6">
    //                             <path
    //                               className="text-[#57A36D] "
    //                               strokeLinecap="round"
    //                               strokeLinejoin="round"
    //                               d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
    //                             />
    //                           </svg>
    //                         </button>
    //                       </div>
    //                       <div>
    //                         <button>
    //                           <svg
    //                             xmlns="http://www.w3.org/2000/svg"
    //                             fill="none"
    //                             viewBox="0 0 24 24"
    //                             strokeWidth={1.5}
    //                             stroke="currentColor"
    //                             className="size-6">
    //                             <path
    //                               className="text-[#ED578F]"
    //                               strokeLinecap="round"
    //                               strokeLinejoin="round"
    //                               d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
    //                             />
    //                           </svg>
    //                         </button>
    //                       </div>
    //                     </div>
    //                   </td>
    //                 </tr>
    //               ))}
    //             </tbody>
    //           </table>
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </div>
    <div>
      <Table
        pagination={false}
        dataSource={getAuthor?.data?.author_list || []}
        columns={column}
        loading={getAuthor.isLoading}
      />

      <Pagination
        defaultCurrent={1}
        onChange={(page, pageSize) => {
          navigate(`/authors?page=${page}`);
        }}
        total={getAuthor?.data?.pagination?.totalRecords || 0} // Kiểm tra kỹ cấu trúc trả về từ API
      />
    </div>
  );
};

export default AuthorPage;
