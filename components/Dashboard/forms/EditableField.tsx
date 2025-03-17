import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Pencil, X } from 'lucide-react'
import React, { useState } from 'react'

interface EditableFieldProps {
    label: string
    value: string
    onSave: (newValue: string) => void
  }
  

const EditableField = ({ label, value, onSave }: EditableFieldProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedValue, setEditedValue] = useState(value)
  
    const handleSave = () => {
      onSave(editedValue)
      setIsEditing(false)
    }
  
    return (
      <div className="space-y-2">
        <Label htmlFor={label.toLowerCase()}>{label}</Label>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Input
                className='w-full bg-gray-50  border-[#acc2ef]'
                id={label.toLowerCase()}
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
              />
              <Button onClick={handleSave}  size="icon"  className='bg-gray-50  border-[#acc2ef] text-gray-600'>
              <Check className="h-4 w-4"/>
              </Button>
              <Button  size="icon" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4"/>
              </Button>
            </>
          ) : (
            <>
              <Input id={label.toLowerCase()} value={value} readOnly className='w-full bg-gray-50  border-[#acc2ef]' />
              <Button onClick={() => setIsEditing(true)}  size="icon"  className='bg-gray-50  border-[#acc2ef] text-gray-600 hover:bg-gray-50 hover:border-[#acc2ef] '>
              <Pencil  className="h-4 w-4"/>
              </Button>
            </>
          )}
        </div>
      </div>
    )
}

export default EditableField
