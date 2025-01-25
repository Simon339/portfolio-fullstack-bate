import {  BadgeCheck } from 'lucide-react';

const BackEnd = () => {
  return (
    <div className="skills_content">
            <h3 className="skills_title">Back-end and Web Developer</h3>

            <div className="skills_box">
                <div className="skills_group">
                    <div className="skills_data">
                    <BadgeCheck className='bx bx-badge-check'/>

                    <div>
                        <h3 className="skills_name">Next js</h3>
                        <span className="skills_level">Advanced</span>
                    </div>

                    </div>
                    <div className="skills_data">
                        <BadgeCheck className='bx bx-badge-check'/>

                        <div>
                            <h3 className="skills_name">PHP</h3>
                            <span className="skills_level">Beginner</span>
                        </div>
                    </div>
                </div>

                <div className="skills_group">
                    <div className="skills_data">
                    <BadgeCheck className='bx bx-badge-check'/>

                    <div>
                        <h3 className="skills_name">Vite </h3>
                        <span className="skills_level">Advanced</span>
                    </div>
                    </div>

                    <div className="skills_data">
                        <BadgeCheck className='bx bx-badge-check'/>

                        <div>
                            <h3 className="skills_name">React js</h3>
                            <span className="skills_level">Advanced</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default BackEnd