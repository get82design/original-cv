import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext"
import { GetPrimaryColor } from "@/features/cv-editor/utils/utilsCv/color"
import { useChangeTextFormat } from "@/features/cv-editor/utils/utilsCv/font"
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema"
import { FaTimes } from "react-icons/fa"

interface DataInputProps {
    model: BaseTextSettings
    changeSize: '1px' | '2px' | '4px'
  }
  
  interface TagCvProps {
    style: 'border' | 'tag' | 'hashtag' | 'none'
    content: string
    // color: string;
    index: number
    idx: number
    deleteSkill: (index: number, idx: number) => void
    dataInput: DataInputProps
  }
  
  export const TagCv = ({
    style,
    content,
    // color,
    index,
    idx,
    deleteSkill,
    dataInput,
  }: TagCvProps) => {
    const { getSize, getWeight } = useChangeTextFormat(dataInput)
    const primaryColor = GetPrimaryColor()
    switch (style) {
      case 'tag':
        return (
          <div
            key={idx}
            className="rounded-full"
            style={{
              backgroundColor: `var(--${primaryColor})`,
              fontSize: getSize(),
              fontWeight: getWeight(),
            }}
          >
            <div className="flex gap-2 items-center px-3 py-1 text-white">
              <InTagCv
                content={content}
                index={index}
                idx={idx}
                deleteSkill={deleteSkill}
              />
            </div>
          </div>
        )
      case 'hashtag':
        return (
          <div
            key={idx}
            className="flex px-3 py-1"
            style={{ fontSize: getSize(), fontWeight: getWeight() }}
          >
            <span style={{ color: `var(--${primaryColor})` }}>#</span>
            <div className="flex gap-2 items-center ">
              <InTagCv
                content={content}
                index={index}
                idx={idx}
                deleteSkill={deleteSkill}
              />
            </div>
          </div>
        )
      case 'border':
        return (
          <div
            key={idx}
            className="flex px-2.5 py-0.5 border rounded-md"
            style={{
              borderColor: `var(--${primaryColor})`,
              fontSize: getSize(),
              fontWeight: getWeight(),
            }}
          >
            <div className="flex gap-2 items-center ">
              <InTagCv
                content={content}
                index={index}
                idx={idx}
                deleteSkill={deleteSkill}
              />
            </div>
          </div>
        )
      case 'none':
        return (
          <div
            key={idx}
            style={{ fontSize: getSize(), fontWeight: getWeight() }}
            className="flex px-3 py-1"
          >
            <div className="flex gap-2 items-center ">
              <InTagCv
                content={content}
                index={index}
                idx={idx}
                deleteSkill={deleteSkill}
              />
            </div>
          </div>
        )
      default:
        return
    }
  }
  
  interface InTagCvProps {
    content: string
    index: number
    idx: number
    deleteSkill: (index: number, idx: number) => void
  }
  
  const InTagCv = ({ deleteSkill, content, index, idx }: InTagCvProps) => {
    const { sectionSelected } = useCreateCvContext()
    // console.log('sectionSelected:', sectionSelected);
    return (
      <>
        <span className="my-0">{content}</span>
        {sectionSelected.includes('skill') && (
          <FaTimes
            style={{ width: '12px', height: '12px', cursor: 'pointer' }}
            onClick={() => deleteSkill(index, idx)}
          />
        )}
      </>
    )
  }