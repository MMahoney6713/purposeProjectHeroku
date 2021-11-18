$(function () {

    // Helpful jQuery objects for later use
    const monthlyViewDiv = $('.month-views');
    const milestoneModal = $('#milestone-modal')
    
    
    /////////////////////////////////////////////////////////////////////////////////////
    ///// Add event handlers for add/edit/delete milestone actions on the calendars /////
    /////////////////////////////////////////////////////////////////////////////////////

    monthlyViewDiv.on('click', 'td.milestone-space', async function (event) {
        target = $(event.target);
        const clickedCalendarCell = $(event.target).closest('td');

        if (target.is('td')) {
            tempMilestone = showTemporaryMilestone(clickedCalendarCell);
            setupAndShowModal(clickedCalendarCell, tempMilestone, 'post', milestone={});

        } else if (target.is('a')) {
            milestoneID = target.parent().parent().data('id');

            if (target.hasClass('milestone-delete')) {
                await Milestone.delete(milestoneID);
                target.parent().parent().remove();

            } else if (target.hasClass('milestone-update')) {
                tempMilestone = target.parent().parent();
                const milestone = await Milestone.getOne(milestoneID);
                setupAndShowModal(clickedCalendarCell, tempMilestone, 'put', milestone)
            }
        }
    })

    function showTemporaryMilestone(calendarCell) {
        tempMilestone = Milestone.emptyMilestone();
        calendarCell.append(tempMilestone);
        return tempMilestone;
    }

    function setupAndShowModal(calendarCell, tempMilestone, requestType, milestone) {
        milestoneModal.modal('show');
        const [year, month, day] = calendarCell.attr('id').split('-'); 
        $('#milestone-year').val(year);
        $('#milestone-month').val(month);
        $('#milestone-day').val(day);

        if (milestone) {
            $('#milestone-title').val(milestone.title);
        }

        addModalListeners(milestoneModal, calendarCell, tempMilestone, requestType, milestone);
    }

    function addModalListeners(milestoneModal, calendarCell, tempMilestone, requestType, milestone) {
        
        $('.btn-milestone-create').on('click', async function(event) {
            event.preventDefault();

            const milestoneData = retreiveMilestoneDataFromModal()
            const errors = validateMilestoneInputs(milestoneData);
            if (errors.length === 0) {

                let newMilestone = {};

                if (requestType === "post") {
                    newMilestone = await Milestone.post(milestoneData);
                } else if (requestType === "put") {
                    milestoneData['id'] = milestone.id;
                    newMilestone = await Milestone.put(milestoneData)
                }

                calendarCell = $(`#${newMilestone.year}-${newMilestone.month}-${newMilestone.day}`);
                calendarCell.append(newMilestone.HTML());

                tempMilestone.remove();
            } 

            milestoneModal.modal('hide');
            $('#milestone-title').val('');
            $('#milestone-goal').val('');
            $('.btn-milestone-create').off();
        })

        $('.btn-milestone-cancel').on('click', function() {
            milestoneModal.modal('hide');
            tempMilestone.remove();
        })
    }


    function validateMilestoneInputs(milestoneInputs) {
        return [];
    }

    function retreiveMilestoneDataFromModal() {
        return {
            'year': $('#milestone-year').val(),
            'month': $('#milestone-month').val(),
            'day': $('#milestone-day').val(),
            'title': $('#milestone-title').val(),
            // 'goal_id': $('#milestone-goal').val(),
            'goal_id': '',
        }
    }
})