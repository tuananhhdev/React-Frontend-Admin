import {
  DeleteOutlined,
  EditFilled,
  EyeOutlined,
  PlusOutlined,
  UploadOutlined,
  XOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Flex,
  message,
  Popconfirm,
  Space,
  Table,
  Spin,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
  Pagination,
  Radio,
  Upload,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "./ProductPage.css";

interface IProduct {
  _id: string;
  product_name: string;
  categoryId: string; // Thay đổi nếu cần
  price: number;
  description: string;
  status: "Active" | "Inactive";
  photo?: string; // Thêm nếu có trường thumbnail
}

interface ICategory {
  _id: string;
  category_name: string;
}

const ProductPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadMethod, setUploadMethod] = useState("url");

  const formatCurrency = (value) => {
    return value.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  // Fetch Category
  const fetchCategories = async () => {
    const response = await axios.get("http://localhost:8080/api/v1/categories");
    return response.data.data; // Giả sử dữ liệu trả về từ API là một mảng các danh mục
  };

  const { data: categories, isLoading: isCategoriesLoading } = useQuery<
    ICategory[]
  >({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // ========== Add New Product ==========
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const { handleSubmit, register, reset } = useForm();
  const [formCreate] = Form.useForm();
  const fetchProduct = async () => {
    const url = `http://localhost:8080/api/v1/products`;
    const res = await axios.get(url);
    return res.data.data;
  };
  const addProduct = useMutation({
    mutationFn: async (productData) => {
      const url = `http://localhost:8080/api/v1/products`;
      const res = await axios.post(url, productData);
      return res.data;
    },
    onSuccess: () => {
      messageApi.success("Thêm sản phẩm thành công!");
      reset(); // Reset form sau khi thêm thành công
      setIsModalAddOpen(false); // Đóng modal
      getProducts.refetch(); // Tải lại danh sách sản phẩm
    },
    onError: (error) => {
      console.log(error);
      messageApi.error("Thêm sản phẩm thất bại!");
    },
  });
  const onSubmit = (data) => {
    // Tạo đối tượng productData từ dữ liệu form
    const productData = {
      product_name: data.product_name, // Tên sản phẩm
      price: parseFloat(data.price) || 0, // Giá sản phẩm (chuyển đổi sang số)
      photo: data.photo,
      category: data.category,
      description: data.description,
    };

    console.log("Data to be sent:", productData); // Log giá trị của productData để kiểm tra

    // Gửi dữ liệu tới server
    addProduct.mutate(productData);
  };

  const getProducts = useQuery<IProduct[]>({
    queryKey: ["products"],
    queryFn: fetchProduct,
  });
  console.log(getProducts.data);

  // ========== Uploads ==============
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ cho phép tải lên file ảnh!");
    }
    return isImage || Upload.LIST_IGNORE;
  };

  const handleUploadChange = (info) => {
    if (info.file.status === "done") {
      formCreate.setFieldsValue({ photo: info.file.response.url });
    }
  };

  // ========== Delete Product ==============
  const deleteProduct = useMutation({
    mutationFn: async (productId) => {
      const url = `http://localhost:8080/api/v1/products/${productId}`;
      await axios.delete(url);
    },
    onSuccess: () => {
      messageApi.success("Xóa sản phẩm thành công!");
    },
    onError: (error) => {
      console.log(error.message);
      messageApi.error("Xóa sản phẩm thất bại!");
    },
  });

  // ========== Update Product ==========
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formUpdate] = Form.useForm();

  const updateProduct = useMutation({
    mutationFn: async (productData) => {
      const url = `http://localhost:8080/api/v1/products/${productData._id}`;
      await axios.put(url, productData);
    },
    onSuccess: () => {
      messageApi.success("Cập nhật sản phẩm thành công!");
      setIsModalVisible(false);
      // Sau khi cập nhật thành công, có thể gọi lại API để cập nhật danh sách sản phẩm
      getProducts.refetch();
    },
    onError: () => {
      messageApi.error("Cập nhật sản phẩm thất bại!");
    },
  });

  // Mở modal và load dữ liệu của sản phẩm được chọn
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    formUpdate.setFieldsValue({
      product_name: product.product_name,
      price: product.price,
      photo: product.photo,
      category: product.category,
      description: product.description,
    });
    setIsModalVisible(true);
  };

  // Xử lý cập nhật sản phẩm sau khi nhấn "Lưu"
  const handleUpdateProduct = (values) => {
    const updatedProduct = {
      ...editingProduct,
      ...values, // Thay thế các giá trị đã chỉnh sửa
    };
    updateProduct.mutate(updatedProduct);
  };
  const getCategoryName = (categoryId: string, categories: ICategory[]) => {
    const category = categories.find((cat) => cat._id === categoryId); // Tìm danh mục
    return (
      <span>{category ? category.category_name : "Unknown Category"}</span>
    ); // Hiển thị tên danh mục
  };

  // ========== Search Product ==========
  //   const handleInputChange = (event) => {
  //     setSearchTerm(event.target.value);
  //   };
  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Nếu ô tìm kiếm trống, thiết lập lại danh sách sản phẩm hiển thị
    if (value.trim() === "") {
      setSearchQuery(""); // Đặt lại từ khóa tìm kiếm
      setDisplayedProducts(getProducts.data); // Đặt lại danh sách sản phẩm hiển thị
    }
  };
  // Hàm thực hiện tìm kiếm khi nhấn vào nút "Search"
  const handleSearch = () => {
    setSearchQuery(searchTerm.toLowerCase()); // Cập nhật từ khóa tìm kiếm đã xác nhận
  };

  const filteredProducts = getProducts?.data?.filter(
    (product) =>
      product.product_name.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery)
  );

  // Lọc sản phẩm dựa trên từ khóa tìm kiếm
  // Lọc sản phẩm dựa trên từ khóa tìm kiếm đã xác nhận
  //   const filteredProducts = getProducts?.data?.filter(
  //     (product) =>
  //       product.product_name.toLowerCase().includes(searchQuery) ||
  //       product.description.toLowerCase().includes(searchQuery)
  //   );

  const queryClient = useQueryClient();
  const updateProductStatus = async (id: string, newStatus: string) => {
    try {
      console.log("Updating status to:", newStatus); // Kiểm tra giá trị status
      const response = await axios.put(
        `http://localhost:8080/api/v1/products/${id}/status`,
        {
          status: newStatus, // Gửi status
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update product status:", error);
      throw error;
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    try {
      await updateProductStatus(id, newStatus);

      // Invalidate query để React Query tự động fetch lại dữ liệu
      queryClient.invalidateQueries("products");
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "_id",
      key: "id",
      render: (text, record, index) => <span>{index + 1}</span>,
    },
    {
      title: "Thumbnail",
      dataIndex: "photo",
      key: "thumbnail",
      render: (photo) => (
        <img
          src={photo}
          alt="thumbnail"
          style={{
            width: 100, // Điều chỉnh kích thước
            height: 100, // Điều chỉnh kích thước
            objectFit: "cover", // Giữ tỷ lệ khung hình
            borderRadius: "8px", // Bo góc
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)", // Đổ bóng
            border: "2px solid #f0f0f0", // Viền nhẹ
            transition: "transform 0.2s", // Hiệu ứng khi hover
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          } // Hiệu ứng zoom khi hover
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")} // Quay lại kích thước ban đầu
        />
      ),
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      render: (product_name) => <p>{product_name}</p>,
    },
    {
      title: "Category Name", // Tiêu đề cột
      dataIndex: "category", // ID danh mục
      key: "category",
      render: (categoryId) => {
        const category = categories.find((cat) => cat._id === categoryId); // Tìm danh mục
        return (
          <span>{category ? category.category_name : "Unknown Category"}</span>
        ); // Hiển thị tên danh mục
      },
    },

    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => <span>{formatCurrency(price)}</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Tooltip title="Chỉnh sửa sản phẩm">
            <Button type="link" onClick={() => handleEditProduct(record)}>
              <EditFilled className="text-xl text-lime-600 hover:text-lime-500" />
            </Button>
          </Tooltip>
          <Tooltip title="Xóa sản phẩm">
            <Popconfirm
              title="Xóa sản phẩm"
              description="Bạn có chắc chắn muốn xóa sản phẩm này không?"
              onConfirm={() => deleteProduct.mutate(record._id)}>
              <Button type="link">
                <DeleteOutlined className="text-xl text-rose-600 hover:text-rose-700" />
              </Button>
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Xem chi tiết sản phẩm">
            <Button
              type="link"
              onClick={() => {
                setSelectedProduct(record); // Lưu sản phẩm được chọn để xem
                setIsModalAddVisible(true); // Mở modal
              }}>
              <EyeOutlined className="text-xl text-sky-500 hover:text-sky-600" />
            </Button>
          </Tooltip>
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <Tag
          color={text === "Active" ? "green" : "volcano"}
          onClick={() => handleStatusChange(record._id, text)} // Thay đổi trạng thái khi click vào tag
          style={{ cursor: "pointer" }}>
          {text}
        </Tag>
      ),
    },
  ];
  const productCount = Array.isArray(filteredProducts)
    ? filteredProducts.length
    : 0;
  return (
    <div>
      {contextHolder}

      <h1 className="mb-10 text-4xl font-medium">Products List</h1>
      <p>Total products : {productCount}</p>
      {/* Search Form  */}
      {/* <Flex className="mb-5" justify="space-between" align="center">
        <div className="w-[300px]">
          <div className="relative  mt-2">
            <input
              className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-md  pl-5 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search product..."
            />
            <button
              onClick={handleSearch}
              className="absolute right-1 top-1 rounded bg-slate-800 p-1.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
              type="button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <button
          className="bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-900"
          onClick={() => setIsModalAddOpen(true)}>
          <PlusOutlined /> Thêm sản phẩm
        </button>
      </Flex>
      {getProducts.isLoading ? (
        <Spin tip="Loading..." />
      ) : getProducts.isError ? (
        <p>Error: {getProducts.error.message}</p>
      ) : getProducts.data && getProducts.data.length > 0 ? (
        <Table
          dataSource={
            filteredProducts.length > 0 ? filteredProducts : getProducts.data
          }
          columns={columns}
          rowKey="_id"
          pagination={{
            pageSize: 5,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} sản phẩm`,
            showSizeChanger: false,
          }}
        />
      ) : (
        <Flex className="items-center justify-center text-xl text-gray-500 mt-10">
          Không có dữ liệu
        </Flex>
      )} */}

      {/* Table  */}

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                No
              </th>
              <th scope="col" className="px-6 py-3">
                Thumbnail
              </th>
              <th scope="col" className="px-6 py-3">
                Product Name
              </th>
              <th scope="col" className="px-6 py-3">
                Category
              </th>
              <th scope="col" className="px-6 py-3">
                Price
              </th>
              <th scope="col" className="px-6 py-3">
                Description
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <tr
                  key={product._id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    <img
                      src={product.photo[0] || "default-thumbnail.jpg"} // Sử dụng ảnh mặc định nếu không có ảnh
                      alt={product.product_name}
                      className="w-16 h-16 object-cover rounded" // Điều chỉnh kích thước ảnh
                    />
                  </td>
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {product.product_name}
                  </th>
                  <td className="px-6 py-4">
                    {getCategoryName(product.category, product._categoryId)}
                  </td>
                  <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4">{product.description || "N/A"}</td>
                  <td>
                    <Tag
                      color={product.status === "Active" ? "green" : "volcano"}
                      onClick={() =>
                        handleStatusChange(product._id, product.status)
                      }
                      style={{ cursor: "pointer" }}>
                      {product.status}
                    </Tag>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href="#"
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                      Edit
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm mới sản phẩm  */}
      <Modal
        title="Thêm sản phẩm mới"
        open={isModalAddOpen}
        onCancel={() => setIsModalAddOpen(false)}
        footer={null}
        className={`add-product-modal ${isModalAddOpen ? "open" : ""}`}
        style={{ top: 20 }}>
        <Form layout="vertical" onFinish={onSubmit}>
          <Form.Item
            label="Tên sản phẩm"
            name="product_name"
            rules={[
              { required: true, message: "Vui lòng nhập tên sản phẩm" },
              { max: 100, message: "Tên sản phẩm không được quá 100 ký tự" },
            ]}>
            <Input placeholder="Tên sản phẩm" />
          </Form.Item>

          <Form.Item label="Phương thức upload ảnh">
            <Radio.Group
              onChange={(e) => setUploadMethod(e.target.value)}
              value={uploadMethod}>
              <Radio value="url">Nhập URL</Radio>
              <Radio value="upload">Tải ảnh lên</Radio>
            </Radio.Group>
          </Form.Item>

          {/* Hiển thị trường nhập URL hoặc Upload dựa trên lựa chọn */}
          {uploadMethod === "url" ? (
            <Form.Item
              label="URL hình ảnh"
              name="photo"
              rules={[
                { required: true, message: "Vui lòng nhập URL hình ảnh" },
                { type: "url", message: "Vui lòng nhập một URL hợp lệ" },
              ]}>
              <Input placeholder="URL hình ảnh" />
            </Form.Item>
          ) : (
            <Form.Item
              label="Tải ảnh lên"
              name="photo"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                return e && e.fileList;
              }}
              rules={[{ required: true, message: "Vui lòng tải lên một ảnh" }]}>
              <Upload
                name="photo"
                action="/api/upload" // Đường dẫn API upload của bạn
                listType="picture"
                beforeUpload={beforeUpload}
                onChange={handleUploadChange}>
                <Button icon={<UploadOutlined />}>Chọn file</Button>
              </Upload>
            </Form.Item>
          )}

          <Form.Item
            label="Danh mục sản phẩm"
            name="category"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}>
            <Select placeholder="Chọn danh mục" loading={isCategoriesLoading}>
              {categories?.map((category) => (
                <Select.Option key={category._id} value={category._id}>
                  {category.category_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá sản phẩm"
            name="price"
            rules={[
              { required: true, message: "Vui lòng nhập giá sản phẩm" },
              {
                type: "number",
                min: 0,
                message: "Giá sản phẩm phải lớn hơn hoặc bằng 0",
              },
            ]}>
            <InputNumber
              placeholder="Giá sản phẩm"
              style={{ width: "100%" }}
              controls={false} // Ẩn các điều khiển
            />
          </Form.Item>

          <Form.Item
            label="Mô tả sản phẩm"
            name="description"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả sản phẩm" },
              { max: 500, message: "Mô tả không được quá 500 ký tự" },
            ]}>
            <Input.TextArea placeholder="Mô tả sản phẩm" rows={4} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="submit-button"
              disabled={getProducts.isLoading}>
              {getProducts.isLoading ? "Đang thêm..." : "Thêm sản phẩm"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal hiển thị chi tiết sản phẩm */}
      <Modal
        title={
          <div className="modal-header">
            <h2 className="modal-title">Chi tiết sản phẩm</h2>
          </div>
        }
        open={isModalAddVisible}
        onCancel={() => setIsModalAddVisible(false)}
        footer={[
          <Button
            key="close"
            className="button-close"
            onClick={() => setIsModalAddVisible(false)}>
            Đóng
          </Button>,
        ]}
        centered
        bodyStyle={{ padding: "20px" }}
        className="modal-custom">
        {selectedProduct && (
          <div className="modal-body">
            <h2 className="product-name">{selectedProduct.product_name}</h2>
            <p className="product-price">
              <strong>Giá:</strong> {formatCurrency(selectedProduct.price)}
            </p>
            <p className="product-description">
              <strong>Mô tả:</strong> {selectedProduct.description}
            </p>
            <p className="product-category">
              <strong>Danh mục:</strong>{" "}
              {categories?.find(
                (category) => category._id === selectedProduct.category
              )?.category_name || "Không có"}
            </p>
            <img
              src={selectedProduct.photo}
              alt="Ảnh sản phẩm"
              className="product-image"
            />
          </div>
        )}
      </Modal>

      {/* Modal chỉnh sửa sản phẩm */}
      <Modal
        title="Chỉnh sửa sản phẩm"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => formUpdate.submit()}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Huỷ
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => formUpdate.submit()}>
            Lưu
          </Button>,
        ]}
        style={{ top: 20 }}
        bodyStyle={{ padding: "20px" }}>
        <Form form={formUpdate} onFinish={handleUpdateProduct}>
          <Form.Item
            label="Tên sản phẩm"
            name="product_name"
            rules={[
              { required: true, message: "Vui lòng nhập tên sản phẩm!" },
            ]}>
            <Input
              placeholder="Nhập tên sản phẩm"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}>
            <Input
              type="number"
              placeholder="Nhập giá sản phẩm"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            label="URL hình ảnh"
            name="photo"
            rules={[
              { required: true, message: "Vui lòng nhập URL hình ảnh!" },
            ]}>
            <Input
              placeholder="Nhập URL hình ảnh"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            label="Danh mục sản phẩm"
            name="category"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}>
            <Select
              placeholder="Chọn danh mục"
              loading={isCategoriesLoading}
              style={{ borderRadius: "8px" }}>
              {categories?.map((category) => (
                <Select.Option key={category._id} value={category._id}>
                  {category.category_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Mô tả sản phẩm"
            name="description"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả sản phẩm" },
              { max: 500, message: "Mô tả không được quá 500 ký tự" },
            ]}>
            <Input.TextArea
              placeholder="Mô tả sản phẩm"
              rows={4}
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductPage;
