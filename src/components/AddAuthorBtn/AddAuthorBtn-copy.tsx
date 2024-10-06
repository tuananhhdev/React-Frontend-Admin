import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Select,
  Upload,
  type GetProp,
  type UploadFile,
  type UploadProps,
} from "antd";
import { useState } from "react";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import axiosClient from "../../lib/axiosClient";
import {} from ''
import { useSearchParams } from "react-router-dom";
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const AddAuthor = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const queryClient = useQueryClient();
  const [params] = useSearchParams();

  const page_str = params.get("page");
  const page = page_str ? page_str : 1;

  const category_str = params.get("category");
  const category_id = category_str ? category_str : null;
  const fetchCategories = async () => {
    const res = await axiosClient.get("/categories");
    return res.data.data;
  };

  const queryCategories = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const [formCreate] = Form.useForm();
  const fetchCreateAuthor = async (payload) => {
    const url = `http://localhost:8080/api/v1/authors`;
    console.log("Payload being sent to server:", payload); // Log payload
    const res = await axiosClient.post(url, payload);
    return res.data;
  };

  const createMutationAuthor = useMutation({
    mutationFn: fetchCreateAuthor,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["authors"],
      });
      //Hiển thị một message thông báo là xóa thành công
      messageApi.open({
        type: "success",
        content: "Add new author successfully",
      });
      //Đóng modal
      setIsModalAddOpen(false);
      //clear data từ form
      formCreate.resetFields();
    },
    onError: (error) => {
      console.log(error);
      messageApi.open({
        type: "error",
        content: "Failed to add new author!",
      });
    },
  });
  const showModalAdd = () => {
    setIsModalAddOpen(true);
  };

  const handleOkAdd = () => {
    console.log("oK Model");
    formCreate.submit();
  };

  const handleCancelAdd = () => {
    setIsModalAddOpen(false);
  };
  const onFinishAdd = async (values) => {
    if (fileList.length === 0) {
      message.error("Vui lòng chọn file trước khi tải lên.");
      return;
    }

    const formData = new FormData();
    // Lặp qua tất cả các trường trong values và thêm chúng vào formData
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });

    fileList.forEach((file) => {
      formData.append("file", file as FileType);
    });

    console.log(formData);
    //gọi API để tạo mới sản phẩm
    createMutationAuthor.mutate(formData);
  };

  const onFinishFailedAdd = async (errorInfo) => {
    console.log("errorInfo:", errorInfo);
  };

  // const uploadProps: UploadProps = {
  //   onRemove: (file) => {
  //     const index = fileList.indexOf(file);
  //     const newFileList = fileList.slice();
  //     newFileList.splice(index, 1);
  //     setFileList(newFileList);
  //   },
  //   beforeUpload: (file) => {
  //     setFileList([file]);
  //     return false;
  //   },
  //   fileList,
  // };
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
      <div>
        {contextHolder}
        <Flex>
          <Button color="default" variant="solid" onClick={showModalAdd}>
            <PlusOutlined />
            Add author
          </Button>
        </Flex>

        <div>
          <Modal
            title="Add new author"
            open={isModalAddOpen}
            onOk={handleOkAdd}
            okText={"Add new"}
            onCancel={handleCancelAdd}
            width={500}>
            <Form
              form={formCreate}
              name="form-create"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              style={{ maxWidth: 500 }}
              initialValues={{ remember: true }}
              onFinish={onFinishAdd}
              onFinishFailed={onFinishFailedAdd}
              autoComplete="off">
              <Form.Item
                label="Photo"
                name="photo"
                rules={[{ required: true, message: "Please upload photo!" }]}>
                <Upload {...uploadProps} name="file">
                  <Button icon={<UploadOutlined />}>Select file</Button>
                </Upload>
              </Form.Item>

              <Form.Item
                label="Category"
                name="category"
                rules={[
                  { required: true, message: "Please select category!" },
                ]}>
                <Select
                  options={
                    queryCategories.data &&
                    queryCategories.data.map((c) => {
                      return {
                        value: c._id,
                        label: c.category_name,
                      };
                    })
                  }
                />
              </Form.Item>
              <Form.Item
                label="Author E-mail"
                name="author_email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter valid E-mail!" },
                ]}>
                <Input />
              </Form.Item>
              <Form.Item label="Description" name="author_description">
                <Input.TextArea />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default AddAuthor;
