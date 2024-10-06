import { useState } from "react";
import styled from "styled-components";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Upload,
  GetProp,
  UploadProps,
} from "antd";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadOutlined } from "@ant-design/icons";
const AddAuthorBtn = () => {
  type FormValues = {
    photoUrl: string;
    categoryName: string;
    authorEmail: string;
    categoryDescription: string;
  };

  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const key = "updatable";
  const RalewayFont = styled.p`
    font-family: "Raleway", sans-serif;
  `;
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormValues>({
    mode: "onChange", // Kích hoạt validation theo từng thay đổi
  });
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);

    // Giả lập quá trình thêm tác giả
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Reset lại trạng thái sau khi thêm tác giả
    setIsSubmitting(false);
    reset();
  };
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const fetchCreateProduct = async (payload: any) => {
    const url = "http://localhost:8080/api/v1/authors";
    const res = await axios.post(url, payload);
    return res.data;
  };

  // ========== Add New Author ==========
  const queryClient = useQueryClient();
  const [formCreate] = Form.useForm();
  const createMutationProduct = useMutation({
    mutationFn: fetchCreateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["authors"],
      });
      messageApi.open({
        type: "success",
        content: "Author created successfully",
      });
      setIsModalOpen(false);
      formCreate.resetFields();
    },
    onError: (error) => {
      console.log(error);
      messageApi.open({
        type: "error",
        content: "Author creation failed!",
      });
    },
  });
  const onFinishAdd = async (values) => {
    if (FileList.length === 0) {
      message.error("Please select a file before adding!");
      return;
    }
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    FileList.forEach((file) => {
      formData.append("file", file as FileType);
    });
    console.log(formData);
    createMutationProduct.mutate(formData);
  };
  const handleCancelAll = () => {
    setIsModalOpen(false);
  };
  const handleOkAdd = () => {
    formCreate.submit();
  };

  const onFinishFailedAdd = async (errorInfo) => {
    console.log("errorInfo:", errorInfo);
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([file]); // Chỉ chọn một file, nếu cần nhiều file thì sử dụng `setFileList([...fileList, file])`
      return false; // Tắt upload tự động
    },
    fileList,
  };
  return (
    <>
      <RalewayFont>
        {/* <Button
          className="bg-[#24201C] px-[45px] py-[10px] rounded-none text-[16px] capitalize font-thin"
          onClick={handleOpen}>
          add new author
        </Button> */}
        <div>
          <Button
            className="bg-[#24201C] px-[45px] py-[10px] rounded-none text-[16px] capitalize font-thin"
            onClick={showModal}>
            Add New Author
          </Button>
          <Modal
            title="Add New Author"
            open={isModalOpen}
            onCancel={handleCancelAll}
            footer={null} // Ẩn nút footer mặc định của modal
          >
            {/* Form thêm author */}
            <Form
              form={formCreate}
              name="form-create"
              layout="vertical"
              onFinish={onFinishAdd}
              onFinishFailed={onFinishFailedAdd}
              initialValues={{ remember: true }}>
              <Form.Item
                label="Author Photo"
                name="photo"
                rules={[
                  { required: true, message: "Please enter photo URL!" },
                ]}>
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
              </Form.Item>

              <Form.Item
                label="Category Name"
                name="category_name"
                rules={[
                  { required: true, message: "Please enter category name!" },
                ]}>
                <Input placeholder="Enter category name" />
              </Form.Item>

              <Form.Item
                label="Author Email"
                name="author_email"
                rules={[
                  { required: true, message: "Please enter author email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}>
                <Input placeholder="Enter author email" />
              </Form.Item>

              <Form.Item
                label="Author Description"
                name="author_description"
                rules={[{ max: 500, message: "Max length is 500 characters" }]}>
                <Input.TextArea placeholder="Enter description (optional)" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </RalewayFont>
    </>
  );
};

export default AddAuthorBtn;
