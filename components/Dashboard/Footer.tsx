
import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-2 text-center text-sm backdrop-blur-md text-gray-600">
      &copy; {currentYear} Simon339 Inc. All rights reserved.
    </footer>
  )
}

export default Footer