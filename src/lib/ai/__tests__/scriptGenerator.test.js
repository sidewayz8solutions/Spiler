import { generateScript } from '../scriptGenerator'

describe('Script Generator', () => {
  // Mock Date to control time-based greetings
  const mockDate = (hour) => {
    const date = new Date()
    date.setHours(hour, 0, 0, 0)
    jest.spyOn(global, 'Date').mockImplementation(() => date)
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Time-based greetings', () => {
    test('should use "Good morning" before 12 PM', () => {
      mockDate(10)
      const donor = { first_name: 'John', previous_donation_amount: 0 }
      const script = generateScript(donor)
      
      expect(script.opening).toContain('Good morning John')
    })

    test('should use "Good afternoon" between 12-5 PM', () => {
      mockDate(14)
      const donor = { first_name: 'Jane', previous_donation_amount: 0 }
      const script = generateScript(donor)
      
      expect(script.opening).toContain('Good afternoon Jane')
    })

    test('should use "Good evening" after 5 PM', () => {
      mockDate(19)
      const donor = { first_name: 'Bob', previous_donation_amount: 0 }
      const script = generateScript(donor)
      
      expect(script.opening).toContain('Good evening Bob')
    })
  })

  describe('Donor name handling', () => {
    test('should use first_name when available', () => {
      mockDate(10)
      const donor = { 
        first_name: 'Alice', 
        full_name: 'Alice Johnson',
        previous_donation_amount: 0 
      }
      const script = generateScript(donor)
      
      expect(script.opening).toContain('Good morning Alice')
    })

    test('should extract first name from full_name when first_name not available', () => {
      mockDate(10)
      const donor = { 
        full_name: 'Robert Smith',
        previous_donation_amount: 0 
      }
      const script = generateScript(donor)
      
      expect(script.opening).toContain('Good morning Robert')
    })

    test('should use "there" as fallback when no name available', () => {
      mockDate(10)
      const donor = { previous_donation_amount: 0 }
      const script = generateScript(donor)
      
      expect(script.opening).toContain('Good morning there')
    })
  })

  describe('Previous donor handling', () => {
    test('should generate script for previous donor', () => {
      mockDate(10)
      const donor = { 
        first_name: 'Sarah',
        previous_donation_amount: 100 
      }
      const script = generateScript(donor)
      
      expect(script.opening).toContain('Thank you so much for your previous support of $100')
      expect(script.pitch).toContain('As you know from your previous involvement')
      expect(script.ask).toContain('Would you consider matching or even increasing your previous donation of $100')
      expect(script.closing).toContain('Your continued support means everything to us')
    })

    test('should generate script for new donor', () => {
      mockDate(10)
      const donor = { 
        first_name: 'Mike',
        previous_donation_amount: 0 
      }
      const script = generateScript(donor)
      
      expect(script.opening).toContain('I\'m reaching out to supporters in our community')
      expect(script.pitch).toContain('We\'re working to [campaign goal]')
      expect(script.ask).toContain('Would you be willing to support our campaign today')
      expect(script.closing).toContain('We\'re grateful for your consideration')
    })
  })

  describe('Script structure', () => {
    test('should return all required sections', () => {
      mockDate(10)
      const donor = { first_name: 'Test', previous_donation_amount: 50 }
      const script = generateScript(donor)
      
      expect(script).toHaveProperty('opening')
      expect(script).toHaveProperty('pitch')
      expect(script).toHaveProperty('ask')
      expect(script).toHaveProperty('objections')
      expect(script).toHaveProperty('closing')
    })

    test('should include all objection responses', () => {
      mockDate(10)
      const donor = { first_name: 'Test', previous_donation_amount: 0 }
      const script = generateScript(donor)
      
      const expectedObjections = [
        "I don't have money right now",
        "I already donated",
        "I need to think about it",
        "Not interested",
        "How will the money be used?"
      ]
      
      expectedObjections.forEach(objection => {
        expect(script.objections).toHaveProperty(objection)
        expect(script.objections[objection]).toBeTruthy()
      })
    })
  })

  describe('Objection responses for different donor types', () => {
    test('should provide different "no money" response for previous donors', () => {
      mockDate(10)
      const previousDonor = { first_name: 'Test', previous_donation_amount: 100 }
      const newDonor = { first_name: 'Test', previous_donation_amount: 0 }
      
      const previousScript = generateScript(previousDonor)
      const newScript = generateScript(newDonor)
      
      expect(previousScript.objections["I don't have money right now"]).toContain('$25')
      expect(newScript.objections["I don't have money right now"]).toContain('$10 or $15')
    })
  })

  describe('Closing time sensitivity', () => {
    test('should say "evening" in closing after 5 PM', () => {
      mockDate(19)
      const donor = { first_name: 'Test', previous_donation_amount: 0 }
      const script = generateScript(donor)
      
      expect(script.closing).toContain('Have a wonderful evening')
    })

    test('should say "day" in closing before 5 PM', () => {
      mockDate(14)
      const donor = { first_name: 'Test', previous_donation_amount: 0 }
      const script = generateScript(donor)
      
      expect(script.closing).toContain('Have a wonderful day')
    })
  })
})
